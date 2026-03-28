import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What are social stories?",
    answer: "Social stories are short, personalized narratives that help individuals with autism understand social situations, expectations, and appropriate responses. They break down complex social interactions into clear, manageable steps.",
  },
  {
    question: "How does the AI generation work?",
    answer: "Our AI analyzes the situation you describe and creates a customized story tailored to the individual&apos;s needs. You can specify the complexity level, tone, and visual style to ensure the story is perfectly suited for the person.",
  },
  {
    question: "How many free stories do I get?",
    answer: "Every user gets 3 free social stories to try our service. After that, you can upgrade to Premium for unlimited story generation and advanced features.",
  },
  {
    question: "Can I edit the generated stories?",
    answer: "Yes! After generation, you can edit both the text and regenerate individual images. Premium users have access to additional customization options.",
  },
  {
    question: "What formats can I export to?",
    answer: "You can export your stories as PDF files for printing or digital sharing. Premium users also get access to video generation for each story.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption for all sensitive data, including passwords and personal information. Your stories and account details are stored securely.",
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription at any time from your Settings page. Your Premium access will continue until the end of your billing period.",
  },
  {
    question: "Can I use this for multiple children?",
    answer: "Yes! One Premium account can be used to create unlimited stories for as many individuals as you need.",
  },
  {
    question: "What age range is this suitable for?",
    answer: "Social stories can be beneficial for all ages. You can adjust the complexity and tone to suit anyone from young children to adults.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee. If you&apos;re not satisfied with Premium, contact us within 30 days for a full refund.",
  },
];

export default function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <HelpCircle size={40} color="#3B82F6" />
        </View>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>
          Find answers to common questions about SocialStoryAI
        </Text>
      </View>

      <View style={styles.faqList}>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleExpand(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.question}>{faq.question}</Text>
              {expandedIndex === index ? (
                <ChevronUp size={24} color="#3B82F6" />
              ) : (
                <ChevronDown size={24} color="#6B7280" />
              )}
            </TouchableOpacity>
            {expandedIndex === index && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Still have questions?</Text>
        <Text style={styles.contactText}>
          Contact our support team and we&apos;ll be happy to help!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    gap: 12,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 24,
  },
  answerContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 0,
  },
  answer: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  contactSection: {
    marginTop: 30,
    padding: 24,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
