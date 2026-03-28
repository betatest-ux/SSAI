import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BookOpen, Heart, Users, TrendingUp, CheckCircle2 } from "lucide-react-native";

export default function AboutPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BookOpen size={48} color="#4A90E2" />
        <Text style={styles.title}>About Social Stories</Text>
        <Text style={styles.subtitle}>
          Understanding the power of personalized narratives
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What are Social Stories?</Text>
        <Text style={styles.paragraph}>
          Social stories are short descriptions of a particular situation, event, or activity,
          which include specific information about what to expect and why. They were developed
          by Carol Gray in 1991 to help individuals with autism understand social situations
          and learn appropriate social responses.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How Do They Help?</Text>
        <View style={styles.benefitCard}>
          <Heart size={24} color="#E74C3C" />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Build Understanding</Text>
            <Text style={styles.benefitText}>
              Help individuals understand what to expect in specific situations
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <Users size={24} color="#6C5CE7" />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Improve Social Skills</Text>
            <Text style={styles.benefitText}>
              Teach appropriate responses and behaviors in social contexts
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <TrendingUp size={24} color="#27AE60" />
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Reduce Anxiety</Text>
            <Text style={styles.benefitText}>
              Prepare individuals for new experiences, reducing fear and uncertainty
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Characteristics</Text>
        <View style={styles.characteristicsList}>
          <View style={styles.characteristic}>
            <CheckCircle2 size={20} color="#4A90E2" />
            <Text style={styles.characteristicText}>
              Written from the perspective of the individual
            </Text>
          </View>
          <View style={styles.characteristic}>
            <CheckCircle2 size={20} color="#4A90E2" />
            <Text style={styles.characteristicText}>
              Use simple, clear language appropriate to comprehension level
            </Text>
          </View>
          <View style={styles.characteristic}>
            <CheckCircle2 size={20} color="#4A90E2" />
            <Text style={styles.characteristicText}>
              Include descriptive sentences about the situation
            </Text>
          </View>
          <View style={styles.characteristic}>
            <CheckCircle2 size={20} color="#4A90E2" />
            <Text style={styles.characteristicText}>
              Provide perspective sentences about feelings and thoughts
            </Text>
          </View>
          <View style={styles.characteristic}>
            <CheckCircle2 size={20} color="#4A90E2" />
            <Text style={styles.characteristicText}>
              Suggest appropriate responses or behaviors
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why SocialStoryAI?</Text>
        <Text style={styles.paragraph}>
          Creating effective social stories requires time, understanding, and personalization.
          SocialStoryAI uses advanced AI to generate customized social stories tailored to
          specific situations, complexity levels, and individual needs. Our platform makes it
          easy for parents, educators, and therapists to create high-quality social stories
          in minutes.
        </Text>
      </View>

      <View style={styles.callout}>
        <Text style={styles.calloutText}>
          Research shows that social stories are an evidence-based practice for individuals
          with autism spectrum disorder and can lead to significant improvements in social
          understanding and behavior.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Text style={styles.paragraph}>
          To create your first social story, simply provide the child&apos;s name, describe the
          situation you&apos;d like to address, and choose the appropriate complexity level and
          tone. Our AI will generate a personalized story with accompanying images that you
          can further customize and export as needed.
        </Text>
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
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: "#5D6D7E",
    lineHeight: 26,
  },
  benefitCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 16,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 15,
    color: "#5D6D7E",
    lineHeight: 22,
  },
  characteristicsList: {
    gap: 12,
  },
  characteristic: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  characteristicText: {
    flex: 1,
    fontSize: 15,
    color: "#2C3E50",
    lineHeight: 22,
  },
  callout: {
    backgroundColor: "#E8F4FD",
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  calloutText: {
    fontSize: 15,
    color: "#2C3E50",
    lineHeight: 24,
    fontStyle: "italic" as const,
  },
});
