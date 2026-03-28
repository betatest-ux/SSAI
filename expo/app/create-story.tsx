import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { generateText } from "@rork-ai/toolkit-sdk";
import { trpc } from "@/lib/trpc";

type Complexity = "very-simple" | "simple" | "moderate";
type Tone = "friendly" | "calm" | "encouraging" | "straightforward";
type ImageStyle = "cartoon" | "realistic" | "minimal" | "illustrated";

export default function CreateStoryPage() {
  const router = useRouter();
  const { canGenerateStory } = useAuth();
  const [childName, setChildName] = useState("");
  const [situation, setSituation] = useState("");
  const [complexity, setComplexity] = useState<Complexity>("simple");
  const [tone, setTone] = useState<Tone>("friendly");
  const [imageStyle, setImageStyle] = useState<ImageStyle>("cartoon");
  const [isGenerating, setIsGenerating] = useState(false);

  const createStoryMutation = trpc.stories.create.useMutation();

  const handleGenerate = async () => {
    if (!childName.trim() || !situation.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    if (!canGenerateStory()) {
      Alert.alert(
        "Limit Reached",
        "You've used all your free stories. Upgrade to premium for unlimited access.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => router.push("/pricing" as any) },
        ]
      );
      return;
    }

    setIsGenerating(true);

    try {
      const complexityMap = {
        "very-simple": "very simple sentences (3-5 words each), lots of repetition",
        simple: "simple sentences with basic vocabulary",
        moderate: "moderate complexity with some details",
      };

      const prompt = `Create a social story for ${childName} about "${situation}".

Requirements:
- Complexity: ${complexityMap[complexity]}
- Tone: ${tone}
- Length: 8-12 sentences
- Use first-person perspective when appropriate
- Include clear, simple explanations
- Focus on understanding, expectations, and appropriate responses
- Make it supportive and educational

Format the story with proper paragraphs.`;

      console.log("Generating story with prompt:", prompt);

      let storyContent: string;
      try {
        storyContent = await generateText({ messages: [{ role: "user", content: prompt }] });
        console.log("Generated story:", storyContent);
      } catch (error) {
        console.error("Error generating story text:", error);
        throw new Error("Failed to generate story content. Please try again.");
      }

      const imagePrompts: string[] = [];
      const sentences = storyContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      const keyScenes = [
        sentences[0],
        sentences[Math.floor(sentences.length / 2)],
        sentences[sentences.length - 1],
      ];

      for (const scene of keyScenes) {
        const imagePrompt = `${imageStyle} style illustration: ${scene.trim()}. Child-friendly, autism-appropriate, clear and simple visual.`;
        imagePrompts.push(imagePrompt);
      }

      console.log("Generating images...");

      const imageUrls: string[] = [];
      for (let i = 0; i < imagePrompts.length; i++) {
        try {
          console.log(`Generating image ${i + 1} of ${imagePrompts.length}...`);
          const response = await fetch("https://toolkit.rork.com/images/generate/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: imagePrompts[i], size: "1024x1024" }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Image ${i + 1} generation failed:`, errorText);
            continue;
          }

          const data = await response.json();
          if (data.image?.base64Data && data.image?.mimeType) {
            imageUrls.push(`data:${data.image.mimeType};base64,${data.image.base64Data}`);
          }
        } catch (error) {
          console.error(`Error generating image ${i + 1}:`, error);
        }
      }

      console.log(`Images generated: ${imageUrls.length} successful, saving story...`);

      if (imageUrls.length === 0) {
        console.warn("No images were generated successfully");
      }

      const story = await createStoryMutation.mutateAsync({
        childName,
        situation,
        complexity,
        tone,
        imageStyle,
        content: storyContent,
        images: imageUrls,
      });

      console.log("Story saved:", story.id);

      Alert.alert("Success!", "Your social story has been created", [
        { text: "View Story", onPress: () => router.push(`/story/${story.id}` as any) },
      ]);
    } catch (error: any) {
      console.error("Error creating story:", error);
      Alert.alert("Error", error.message || "Failed to create story");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Social Story</Text>
      <Text style={styles.subtitle}>Personalized stories for better understanding</Text>

      <View style={styles.section}>
        <Text style={styles.label}>
          Child&apos;s Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={childName}
          onChangeText={setChildName}
          placeholder="Enter child&apos;s name"
          placeholderTextColor="#BDC3C7"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Situation or Issue <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={situation}
          onChangeText={setSituation}
          placeholder="e.g., Going to the dentist, sharing toys, dealing with changes"
          placeholderTextColor="#BDC3C7"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Story Complexity</Text>
        <View style={styles.optionsRow}>
          {(["very-simple", "simple", "moderate"] as Complexity[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, complexity === option && styles.optionButtonActive]}
              onPress={() => setComplexity(option)}
            >
              <Text
                style={[styles.optionText, complexity === option && styles.optionTextActive]}
              >
                {option === "very-simple" ? "Very Simple" : option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tone</Text>
        <View style={styles.optionsRow}>
          {(["friendly", "calm", "encouraging", "straightforward"] as Tone[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, tone === option && styles.optionButtonActive]}
              onPress={() => setTone(option)}
            >
              <Text style={[styles.optionText, tone === option && styles.optionTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Image Style</Text>
        <View style={styles.optionsRow}>
          {(["cartoon", "realistic", "minimal", "illustrated"] as ImageStyle[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, imageStyle === option && styles.optionButtonActive]}
              onPress={() => setImageStyle(option)}
            >
              <Text style={[styles.optionText, imageStyle === option && styles.optionTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generating...</Text>
          </View>
        ) : (
          <Text style={styles.generateButtonText}>Generate Story</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: "800" as const,
    color: "#1A202C",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: "#718096",
    marginBottom: 40,
    fontWeight: "500" as const,
    lineHeight: 26,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  required: {
    color: "#E74C3C",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    fontSize: 17,
    color: "#1A202C",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    fontWeight: "500" as const,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E1E8ED",
  },
  optionButtonActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#7F8C8D",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  generateButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800" as const,
    letterSpacing: 0.4,
  },
});
