import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Menu, 
  Save, 
  X,
  Palette,
  Layout,
  Image as ImageIcon,
  Code,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import * as Haptics from "expo-haptics";

type ContentType = 'text' | 'heading' | 'html' | 'image' | 'button';
type EditorMode = 'pages' | 'content' | 'theme' | 'header-footer';

type PageContent = {
  id: string;
  pageId: string;
  sectionId: string;
  type: ContentType;
  content: string;
  order: number;
  styles?: Record<string, any>;
  metadata?: Record<string, any>;
  updatedAt: string;
};

type Page = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  showInMenu: boolean;
  menuOrder: number;
  showHeader: boolean;
  showFooter: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
};

export default function ContentEditorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<EditorMode>('pages');
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  const [showPageModal, setShowPageModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const [newPage, setNewPage] = useState({
    slug: '',
    title: '',
    isPublished: false,
    showInMenu: true,
    menuOrder: 0,
    showHeader: true,
    showFooter: true,
  });

  const [newContent, setNewContent] = useState({
    type: 'text' as ContentType,
    content: '',
    sectionId: 'hero',
    order: 0,
  });

  const pagesQuery = trpc.content.getAllPagesAdmin.useQuery();
  const pageContentsQuery = trpc.content.getPageContents.useQuery(
    { pageId: selectedPage?.id || '' },
    { enabled: !!selectedPage }
  );
  const themeQuery = trpc.content.getThemeSettings.useQuery();
  const headerFooterQuery = trpc.content.getAllHeaderFooterContents.useQuery();

  const createPageMutation = trpc.content.createPage.useMutation();
  const updatePageMutation = trpc.content.updatePage.useMutation();
  const deletePageMutation = trpc.content.deletePage.useMutation();
  const createContentMutation = trpc.content.createPageContent.useMutation();
  const updateContentMutation = trpc.content.updatePageContent.useMutation();
  const deleteContentMutation = trpc.content.deletePageContent.useMutation();
  const updateThemeMutation = trpc.content.updateThemeSettings.useMutation();
  const updateHeaderFooterMutation = trpc.content.updateHeaderFooterContent.useMutation();

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace("/home" as any);
    }
  }, [user, router]);

  if (!user?.isAdmin) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unauthorized Access</Text>
      </View>
    );
  }

  const handleCreatePage = async () => {
    try {
      await createPageMutation.mutateAsync(newPage);
      pagesQuery.refetch();
      setShowPageModal(false);
      setNewPage({
        slug: '',
        title: '',
        isPublished: false,
        showInMenu: true,
        menuOrder: 0,
        showHeader: true,
        showFooter: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Page created successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create page");
    }
  };

  const handleUpdatePage = async (pageId: string, updates: Partial<Page>) => {
    try {
      await updatePageMutation.mutateAsync({ pageId, ...updates });
      pagesQuery.refetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Page updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update page");
    }
  };

  const handleDeletePage = async (pageId: string) => {
    Alert.alert(
      "Delete Page",
      "Are you sure you want to delete this page? All content will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePageMutation.mutateAsync({ pageId });
              pagesQuery.refetch();
              if (selectedPage?.id === pageId) {
                setSelectedPage(null);
              }
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Success", "Page deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete page");
            }
          },
        },
      ]
    );
  };

  const handleCreateContent = async () => {
    if (!selectedPage) return;

    try {
      await createContentMutation.mutateAsync({
        pageId: selectedPage.id,
        ...newContent,
      });
      pageContentsQuery.refetch();
      setShowContentModal(false);
      setNewContent({
        type: 'text',
        content: '',
        sectionId: 'hero',
        order: 0,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Content created successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create content");
    }
  };

  const handleUpdateContent = async (contentId: string, updates: Partial<PageContent>) => {
    try {
      await updateContentMutation.mutateAsync({ contentId, ...updates });
      pageContentsQuery.refetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update content");
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    Alert.alert(
      "Delete Content",
      "Are you sure you want to delete this content block?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteContentMutation.mutateAsync({ contentId });
              pageContentsQuery.refetch();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete content");
            }
          },
        },
      ]
    );
  };

  const groupedContents = pageContentsQuery.data?.reduce((acc: Record<string, PageContent[]>, content: PageContent) => {
    if (!acc[content.sectionId]) {
      acc[content.sectionId] = [];
    }
    acc[content.sectionId].push(content);
    return acc;
  }, {} as Record<string, PageContent[]>) || {};

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Content Editor</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'pages' && styles.modeButtonActive]}
          onPress={() => setMode('pages')}
        >
          <FileText size={20} color={mode === 'pages' ? '#6366F1' : '#6B7280'} />
          <Text style={[styles.modeButtonText, mode === 'pages' && styles.modeButtonTextActive]}>Pages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === 'content' && styles.modeButtonActive]}
          onPress={() => setMode('content')}
        >
          <Layout size={20} color={mode === 'content' ? '#6366F1' : '#6B7280'} />
          <Text style={[styles.modeButtonText, mode === 'content' && styles.modeButtonTextActive]}>Content</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === 'theme' && styles.modeButtonActive]}
          onPress={() => setMode('theme')}
        >
          <Palette size={20} color={mode === 'theme' ? '#6366F1' : '#6B7280'} />
          <Text style={[styles.modeButtonText, mode === 'theme' && styles.modeButtonTextActive]}>Theme</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, mode === 'header-footer' && styles.modeButtonActive]}
          onPress={() => setMode('header-footer')}
        >
          <Menu size={20} color={mode === 'header-footer' ? '#6366F1' : '#6B7280'} />
          <Text style={[styles.modeButtonText, mode === 'header-footer' && styles.modeButtonTextActive]}>Layout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {mode === 'pages' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Manage Pages</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowPageModal(true)}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>New Page</Text>
              </TouchableOpacity>
            </View>

            {pagesQuery.data?.map((page: Page) => (
              <View key={page.id} style={styles.pageCard}>
                <View style={styles.pageCardHeader}>
                  <View style={styles.pageInfo}>
                    <Text style={styles.pageTitle}>{page.title}</Text>
                    <Text style={styles.pageSlug}>/{page.slug}</Text>
                  </View>
                  <View style={styles.pageActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {
                        setSelectedPage(page);
                        setMode('content');
                      }}
                    >
                      <Edit3 size={18} color="#6366F1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDeletePage(page.id)}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.pageSettings}>
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Published</Text>
                    <Switch
                      value={page.isPublished}
                      onValueChange={(value) => handleUpdatePage(page.id, { isPublished: value })}
                    />
                  </View>
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Show in Menu</Text>
                    <Switch
                      value={page.showInMenu}
                      onValueChange={(value) => handleUpdatePage(page.id, { showInMenu: value })}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {mode === 'content' && (
          <View style={styles.section}>
            {!selectedPage ? (
              <View style={styles.emptyState}>
                <FileText size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>Select a page to edit content</Text>
              </View>
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>{selectedPage.title}</Text>
                    <Text style={styles.sectionSubtitle}>Edit page content</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowContentModal(true)}
                  >
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add Content</Text>
                  </TouchableOpacity>
                </View>

                {Object.entries(groupedContents).map(([sectionId, contents]) => (
                  <View key={sectionId} style={styles.sectionGroup}>
                    <TouchableOpacity
                      style={styles.sectionGroupHeader}
                      onPress={() => toggleSection(sectionId)}
                    >
                      <Text style={styles.sectionGroupTitle}>{sectionId}</Text>
                      {expandedSections[sectionId] ? (
                        <ChevronUp size={20} color="#6B7280" />
                      ) : (
                        <ChevronDown size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>

                    {expandedSections[sectionId] && (contents as PageContent[]).map((content: PageContent) => (
                      <View key={content.id} style={styles.contentCard}>
                        <View style={styles.contentCardHeader}>
                          <View style={styles.contentType}>
                            {content.type === 'heading' && <Text style={styles.contentTypeTag}>H</Text>}
                            {content.type === 'text' && <Text style={styles.contentTypeTag}>T</Text>}
                            {content.type === 'image' && <ImageIcon size={16} color="#6366F1" />}
                            {content.type === 'html' && <Code size={16} color="#6366F1" />}
                          </View>
                          <View style={styles.contentActions}>
                            <TouchableOpacity
                              style={styles.iconButton}
                              onPress={() => setEditingContent(content)}
                            >
                              <Edit3 size={16} color="#6366F1" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.iconButton}
                              onPress={() => handleDeleteContent(content.id)}
                            >
                              <Trash2 size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={styles.contentPreview} numberOfLines={2}>
                          {content.content}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {mode === 'theme' && themeQuery.data && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme Settings</Text>
            <ThemeEditor
              theme={themeQuery.data}
              onUpdate={(updates) => {
                updateThemeMutation.mutate(updates, {
                  onSuccess: () => {
                    themeQuery.refetch();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert("Success", "Theme updated successfully");
                  },
                });
              }}
            />
          </View>
        )}

        {mode === 'header-footer' && headerFooterQuery.data && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Header & Footer</Text>
            <HeaderFooterEditor
              contents={headerFooterQuery.data}
              onUpdate={(type, updates) => {
                updateHeaderFooterMutation.mutate({ type, ...updates }, {
                  onSuccess: () => {
                    headerFooterQuery.refetch();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert("Success", "Layout updated successfully");
                  },
                });
              }}
            />
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showPageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Page</Text>
              <TouchableOpacity onPress={() => setShowPageModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={newPage.title}
                onChangeText={(text) => setNewPage({ ...newPage, title: text })}
                placeholder="Page Title"
              />

              <Text style={styles.label}>Slug</Text>
              <TextInput
                style={styles.input}
                value={newPage.slug}
                onChangeText={(text) => setNewPage({ ...newPage, slug: text })}
                placeholder="page-slug"
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Published</Text>
                <Switch
                  value={newPage.isPublished}
                  onValueChange={(value) => setNewPage({ ...newPage, isPublished: value })}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Show in Menu</Text>
                <Switch
                  value={newPage.showInMenu}
                  onValueChange={(value) => setNewPage({ ...newPage, showInMenu: value })}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.createButton} onPress={handleCreatePage}>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Page</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showContentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Content Block</Text>
              <TouchableOpacity onPress={() => setShowContentModal(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeSelector}>
                {(['text', 'heading', 'html', 'image', 'button'] as ContentType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newContent.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewContent({ ...newContent, type })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newContent.type === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Section ID</Text>
              <TextInput
                style={styles.input}
                value={newContent.sectionId}
                onChangeText={(text) => setNewContent({ ...newContent, sectionId: text })}
                placeholder="hero, features, etc."
              />

              <Text style={styles.label}>Content</Text>
              <RichTextEditor
                value={newContent.content}
                onChange={(text) => setNewContent({ ...newContent, content: text })}
                minHeight={150}
              />

              <Text style={styles.label}>Order</Text>
              <TextInput
                style={styles.input}
                value={newContent.order.toString()}
                onChangeText={(text) => setNewContent({ ...newContent, order: parseInt(text) || 0 })}
                keyboardType="numeric"
                placeholder="0"
              />
            </ScrollView>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateContent}>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Add Content</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {editingContent && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setEditingContent(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Content</Text>
                <TouchableOpacity onPress={() => setEditingContent(null)}>
                  <X size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.label}>Content</Text>
                <RichTextEditor
                  value={editingContent.content}
                  onChange={(text) => setEditingContent({ ...editingContent, content: text })}
                  minHeight={200}
                />
              </ScrollView>

              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  handleUpdateContent(editingContent.id, { content: editingContent.content });
                  setEditingContent(null);
                }}
              >
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function ThemeEditor({ theme, onUpdate }: { theme: any; onUpdate: (updates: any) => void }) {
  const [colors, setColors] = useState({
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    textColor: theme.textColor,
  });

  return (
    <View style={styles.themeEditor}>
      {Object.entries(colors).map(([key, value]) => (
        <View key={key} style={styles.colorRow}>
          <Text style={styles.colorLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
          <View style={styles.colorInputGroup}>
            <View style={[styles.colorPreview, { backgroundColor: value }]} />
            <TextInput
              style={styles.colorInput}
              value={value}
              onChangeText={(text) => setColors({ ...colors, [key]: text })}
              placeholder="#000000"
            />
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => onUpdate(colors)}
      >
        <Save size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Save Theme</Text>
      </TouchableOpacity>
    </View>
  );
}

function HeaderFooterEditor({ contents, onUpdate }: { contents: any[]; onUpdate: (type: 'header' | 'footer', updates: any) => void }) {
  const header = contents.find((c: any) => c.type === 'header');
  const footer = contents.find((c: any) => c.type === 'footer');

  const [headerContent, setHeaderContent] = useState(header?.content || '');
  const [footerContent, setFooterContent] = useState(footer?.content || '');

  return (
    <View style={styles.headerFooterEditor}>
      <Text style={styles.subSectionTitle}>Header</Text>
      <TextInput
        style={styles.input}
        value={headerContent}
        onChangeText={setHeaderContent}
        placeholder="Header text"
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => onUpdate('header', { content: headerContent })}
      >
        <Save size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Save Header</Text>
      </TouchableOpacity>

      <Text style={[styles.subSectionTitle, { marginTop: 24 }]}>Footer</Text>
      <TextInput
        style={styles.input}
        value={footerContent}
        onChangeText={setFooterContent}
        placeholder="Footer text"
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => onUpdate('footer', { content: footerContent })}
      >
        <Save size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Save Footer</Text>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  modeButtonTextActive: {
    color: '#6366F1',
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 14,
  },
  pageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pageInfo: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  pageSlug: {
    fontSize: 14,
    color: '#6B7280',
  },
  pageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  pageSettings: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  sectionGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  sectionGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  sectionGroupTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  contentCard: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  contentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentTypeTag: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  contentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contentPreview: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: '#6366F1',
    fontWeight: '600' as const,
  },
  themeEditor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  colorRow: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  colorInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  headerFooterEditor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
});
