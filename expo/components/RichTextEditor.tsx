import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView } from "react-native";
import { useState, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

type ToolbarAction = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'h1' 
  | 'h2' 
  | 'h3'
  | 'alignLeft' 
  | 'alignCenter' 
  | 'alignRight'
  | 'ul'
  | 'ol'
  | 'link'
  | 'image';

type RichTextEditorProps = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  showToolbar?: boolean;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  minHeight = 100,
  maxHeight = 400,
  showToolbar = true,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleToolbarAction = (action: ToolbarAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const selection = inputRef.current?.props.selection;
    if (!selection) return;

    const { start = 0, end = 0 } = selection;
    const selectedText = value.substring(start, end);
    let newText = value;
    let replacement = selectedText;

    switch (action) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'underline':
        replacement = `<u>${selectedText}</u>`;
        break;
      case 'h1':
        replacement = `# ${selectedText}`;
        break;
      case 'h2':
        replacement = `## ${selectedText}`;
        break;
      case 'h3':
        replacement = `### ${selectedText}`;
        break;
      case 'link':
        replacement = `[${selectedText}](url)`;
        break;
      case 'image':
        replacement = `![${selectedText}](image-url)`;
        break;
      case 'ul':
        replacement = `- ${selectedText}`;
        break;
      case 'ol':
        replacement = `1. ${selectedText}`;
        break;
    }

    newText = value.substring(0, start) + replacement + value.substring(end);
    onChange(newText);
  };

  return (
    <View style={styles.container}>
      {showToolbar && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.toolbar}
          contentContainerStyle={styles.toolbarContent}
        >
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('bold')}
          >
            <Bold size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('italic')}
          >
            <Italic size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('underline')}
          >
            <Underline size={20} color="#374151" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('h1')}
          >
            <Heading1 size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('h2')}
          >
            <Heading2 size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('h3')}
          >
            <Heading3 size={20} color="#374151" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('alignLeft')}
          >
            <AlignLeft size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('alignCenter')}
          >
            <AlignCenter size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('alignRight')}
          >
            <AlignRight size={20} color="#374151" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('ul')}
          >
            <List size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('ol')}
          >
            <ListOrdered size={20} color="#374151" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('link')}
          >
            <Link2 size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleToolbarAction('image')}
          >
            <ImageIcon size={20} color="#374151" />
          </TouchableOpacity>
        </ScrollView>
      )}

      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            minHeight,
            maxHeight,
            borderColor: isFocused ? '#6366F1' : '#E5E7EB',
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Supports Markdown formatting</Text>
        <Text style={styles.characterCount}>{value.length} characters</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toolbar: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: 50,
  },
  toolbarContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    alignItems: 'center',
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
});
