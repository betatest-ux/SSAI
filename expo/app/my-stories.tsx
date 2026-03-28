import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { BookOpen, Calendar } from "lucide-react-native";
import { Header } from "@/components/Header";

export default function MyStoriesPage() {
  const router = useRouter();
  const storiesQuery = trpc.stories.list.useQuery();

  if (storiesQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your stories...</Text>
      </View>
    );
  }

  const stories = storiesQuery.data || [];

  if (stories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BookOpen size={64} color="#BDC3C7" />
        <Text style={styles.emptyTitle}>No Stories Yet</Text>
        <Text style={styles.emptyText}>Create your first social story to get started</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/create-story" as any)}
        >
          <Text style={styles.createButtonText}>Create Story</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Stories</Text>
      <Text style={styles.subtitle}>
        {stories.length} {stories.length === 1 ? "story" : "stories"} created
      </Text>

      {stories.map((story) => (
        <TouchableOpacity
          key={story.id}
          style={styles.storyCard}
          onPress={() => router.push(`/story/${story.id}` as any)}
        >
          <View style={styles.storyHeader}>
            <Text style={styles.storyTitle}>{story.childName}&apos;s Story</Text>
            <View style={styles.dateContainer}>
              <Calendar size={14} color="#7F8C8D" />
              <Text style={styles.dateText}>
                {new Date(story.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <Text style={styles.storySituation} numberOfLines={2}>
            {story.situation}
          </Text>
          <View style={styles.storyFooter}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{story.complexity}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{story.tone}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}  
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },
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
    fontSize: 16,
    color: "#7F8C8D",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8F9FD",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
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
    marginBottom: 24,
  },
  storyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  storyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#2C3E50",
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  storySituation: {
    fontSize: 15,
    color: "#5D6D7E",
    lineHeight: 22,
    marginBottom: 12,
  },
  storyFooter: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "#E8F4FD",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#4A90E2",
    textTransform: "capitalize" as const,
  },
});
