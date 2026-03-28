import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { Edit2, RefreshCw, Download, Trash2, Video, Play } from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";

export default function StoryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [editingContent, setEditingContent] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [regeneratingImage, setRegeneratingImage] = useState<number | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);

  const storyQuery = trpc.stories.get.useQuery({ id: id || "" });
  const updateStoryMutation = trpc.stories.update.useMutation();
  const deleteStoryMutation = trpc.stories.delete.useMutation();
  const generateVideoMutation = trpc.stories.generateVideo.useMutation();

  const story = storyQuery.data;

  const handleSaveText = async () => {
    if (!story) return;
    
    if (!editedText.trim()) {
      Alert.alert("Error", "Story content cannot be empty");
      return;
    }
    
    if (editedText.trim().length < 10) {
      Alert.alert("Error", "Story content is too short");
      return;
    }
    
    try {
      await updateStoryMutation.mutateAsync({
        id: story.id,
        content: editedText,
      });
      setEditingContent(false);
      storyQuery.refetch();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Story updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update story");
    }
  };

  const handleRegenerateImage = async (index: number) => {
    if (!story) return;
    setRegeneratingImage(index);

    try {
      const sentences = story.content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      const scene = sentences[Math.min(index * Math.floor(sentences.length / 3), sentences.length - 1)];
      const imagePrompt = `${story.imageStyle} style illustration: ${scene.trim()}. Child-friendly, autism-appropriate, clear and simple visual.`;

      const response = await fetch("https://toolkit.rork.com/images/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt, size: "1024x1024" }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const data = await response.json();
      const newImageUrl = `data:${data.image.mimeType};base64,${data.image.base64Data}`;

      const newImages = [...story.images];
      newImages[index] = newImageUrl;

      await updateStoryMutation.mutateAsync({
        id: story.id,
        images: newImages,
      });

      storyQuery.refetch();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Image regenerated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to regenerate image");
    } finally {
      setRegeneratingImage(null);
    }
  };

  const handleExportPDF = async () => {
    if (!story) return;

    try {
      const imagesHtml = story.images
        .map(
          (img) =>
            `<div style="text-align: center; margin: 20px 0;"><img src="${img}" style="max-width: 100%; height: auto; border-radius: 8px;" /></div>`
        )
        .join("");

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { color: #2C3E50; }
              .meta { color: #7F8C8D; margin-bottom: 30px; }
              .content { line-height: 1.8; font-size: 16px; color: #2C3E50; }
            </style>
          </head>
          <body>
            <h1>${story.childName}&apos;s Social Story</h1>
            <div class="meta">
              <p><strong>Situation:</strong> ${story.situation}</p>
              <p><strong>Created:</strong> ${new Date(story.createdAt).toLocaleDateString()}</p>
            </div>
            ${imagesHtml}
            <div class="content">${story.content.replace(/\n/g, "<br>")}</div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS !== "web" && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Success", "PDF created successfully");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to export PDF");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Story", "Are you sure you want to delete this story?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteStoryMutation.mutateAsync({ id: id || "" });
            router.back();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete story");
          }
        },
      },
    ]);
  };

  const handleGenerateVideo = async () => {
    if (!story) return;
    
    if (!user?.isPremium) {
      Alert.alert(
        "Premium Feature",
        "Video generation is only available for premium members. Upgrade to premium to unlock this feature.",
        [
          { text: "Maybe Later", style: "cancel" },
          { text: "Upgrade Now", onPress: () => router.push("/pricing" as any) },
        ]
      );
      return;
    }

    try {
      setGeneratingVideo(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await generateVideoMutation.mutateAsync({ storyId: story.id });
      await storyQuery.refetch();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Video generated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate video");
    } finally {
      setGeneratingVideo(false);
    }
  };

  if (storyQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading story...</Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Story not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{story.childName}&apos;s Social Story</Text>
        <Text style={styles.subtitle}>{story.situation}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setEditedText(story.content);
            setEditingContent(true);
          }}
        >
          <Edit2 size={20} color="#4A90E2" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleExportPDF();
          }}
        >
          <Download size={20} color="#27AE60" />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleDelete();
          }}
        >
          <Trash2 size={20} color="#E74C3C" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {user?.isPremium && (
        <View style={styles.videoSection}>
          {story.videoUrl ? (
            <View style={styles.videoCard}>
              <View style={styles.videoCardHeader}>
                <Video size={24} color="#4A90E2" />
                <Text style={styles.videoCardTitle}>Story Video</Text>
              </View>
              <View style={styles.videoPlaceholder}>
                <Play size={48} color="#FFFFFF" />
                <Text style={styles.videoPlaceholderText}>Video Ready</Text>
              </View>
              <Text style={styles.videoCardSubtitle}>Video generated successfully</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.generateVideoButton}
              onPress={handleGenerateVideo}
              disabled={generatingVideo}
            >
              {generatingVideo ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.generateVideoButtonText}>Generating Video...</Text>
                </>
              ) : (
                <>
                  <Video size={20} color="#FFFFFF" />
                  <Text style={styles.generateVideoButtonText}>Generate Video</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {story.images.map((image, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleRegenerateImage(index);
            }}
            disabled={regeneratingImage === index}
          >
            {regeneratingImage === index ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <RefreshCw size={16} color="#FFFFFF" />
                <Text style={styles.regenerateButtonText}>Regenerate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.contentSection}>
        {editingContent ? (
          <>
            <TextInput
              style={styles.textArea}
              value={editedText}
              onChangeText={setEditedText}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditingContent(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveText}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.storyText}>{story.content}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FD",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7F8C8D",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FD",
  },
  errorText: {
    fontSize: 18,
    color: "#E74C3C",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2C3E50",
  },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 300,
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4A90E2",
    padding: 12,
  },
  regenerateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  contentSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 28,
    color: "#2C3E50",
  },
  textArea: {
    backgroundColor: "#F8F9FD",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2C3E50",
    minHeight: 200,
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F8F9FD",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#7F8C8D",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  videoSection: {
    marginBottom: 24,
  },
  videoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  videoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  videoCardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A202C",
  },
  videoPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  videoPlaceholderText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginTop: 12,
  },
  videoCardSubtitle: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
  },
  generateVideoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#6C5CE7",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateVideoButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
