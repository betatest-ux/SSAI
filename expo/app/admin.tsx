import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Platform, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Users, BookOpen, Crown, TrendingUp, Settings as SettingsIcon, Activity, Trash2, Shield, BarChart3, Key, Search, Filter, Calendar, RefreshCw } from "lucide-react-native";
import { useEffect, useState } from "react";
import { LineChart, PieChart } from "react-native-chart-kit";
import * as Haptics from "expo-haptics";

type Tab = "analytics" | "users" | "stories" | "settings" | "logs" | "api-keys" | "contacts" | "mail" | "content";
type DateFilter = "7d" | "30d" | "90d" | "all";
type UserFilter = "all" | "premium" | "free" | "admin";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const [dateFilter, setDateFilter] = useState<DateFilter>("30d");
  const [userFilter, setUserFilter] = useState<UserFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [passwordResetUserId, setPasswordResetUserId] = useState<string | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState("");
  const [subscriptionMonths, setSubscriptionMonths] = useState("1");
  
  const analyticsQuery = trpc.admin.analytics.useQuery();
  const usersQuery = trpc.admin.users.useQuery();
  const storiesQuery = trpc.admin.stories.useQuery();
  const settingsQuery = trpc.admin.getSettings.useQuery();
  const apiKeysQuery = trpc.admin.getApiKeys.useQuery();
  const contactsQuery = trpc.contact.getAll.useQuery(undefined, { enabled: user?.isAdmin });
  const mailConfigQuery = trpc.contact.getMailConfig.useQuery(undefined, { enabled: user?.isAdmin });
  const logsQuery = trpc.admin.getActivityLogs.useQuery();
  
  const togglePremiumMutation = trpc.admin.togglePremium.useMutation();
  const toggleAdminMutation = trpc.admin.toggleAdmin.useMutation();
  const deleteUserMutation = trpc.admin.deleteUser.useMutation();
  const deleteStoryMutation = trpc.admin.deleteStory.useMutation();
  const updateSettingsMutation = trpc.admin.updateSettings.useMutation();
  const updateApiKeysMutation = trpc.admin.updateApiKeys.useMutation();
  const updateContactStatusMutation = trpc.contact.updateStatus.useMutation();
  const deleteContactMutation = trpc.contact.delete.useMutation();
  const replyContactMutation = trpc.contact.reply.useMutation();
  const updateMailConfigMutation = trpc.contact.updateMailConfig.useMutation();
  const testMailMutation = trpc.contact.testMailConnection.useMutation();
  
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [mailConfig, setMailConfig] = useState({
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    fromEmail: "",
    fromName: "SocialStoryAI",
  });
  const resetPasswordMutation = trpc.admin.resetPassword.useMutation();
  const extendSubscriptionMutation = trpc.admin.extendSubscription.useMutation();

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

  const isLoading = analyticsQuery.isLoading || usersQuery.isLoading || storiesQuery.isLoading;
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  const handleTogglePremium = async (userId: string) => {
    try {
      await togglePremiumMutation.mutateAsync({ userId });
      usersQuery.refetch();
      analyticsQuery.refetch();
      logsQuery.refetch();
      Alert.alert("Success", "Premium status updated");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update premium status");
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    try {
      await toggleAdminMutation.mutateAsync({ userId });
      usersQuery.refetch();
      logsQuery.refetch();
      Alert.alert("Success", "Admin status updated");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update admin status");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserMutation.mutateAsync({ userId });
              usersQuery.refetch();
              analyticsQuery.refetch();
              logsQuery.refetch();
              Alert.alert("Success", "User deleted");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const handleDeleteStory = async (storyId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this story?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteStoryMutation.mutateAsync({ storyId });
              storiesQuery.refetch();
              analyticsQuery.refetch();
              logsQuery.refetch();
              Alert.alert("Success", "Story deleted");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete story");
            }
          },
        },
      ]
    );
  };

  const handleUpdateSettings = async (updates: any) => {
    try {
      await updateSettingsMutation.mutateAsync(updates);
      settingsQuery.refetch();
      logsQuery.refetch();
      Alert.alert("Success", "Settings updated");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update settings");
    }
  };

  const handleUpdateApiKey = async (key: string, value: string) => {
    try {
      await updateApiKeysMutation.mutateAsync({ [key]: value });
      apiKeysQuery.refetch();
      logsQuery.refetch();
      Alert.alert("Success", "API key updated");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update API key");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPasswordForUser || newPasswordForUser.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await resetPasswordMutation.mutateAsync({ userId, newPassword: newPasswordForUser });
      usersQuery.refetch();
      logsQuery.refetch();
      setPasswordResetUserId(null);
      setNewPasswordForUser("");
      Alert.alert("Success", "Password reset successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reset password");
    }
  };

  const handleExtendSubscription = async (userId: string) => {
    const months = parseInt(subscriptionMonths);
    if (isNaN(months) || months < 1 || months > 12) {
      Alert.alert("Error", "Please enter a valid number of months (1-12)");
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await extendSubscriptionMutation.mutateAsync({ userId, months });
      usersQuery.refetch();
      analyticsQuery.refetch();
      logsQuery.refetch();
      setSelectedUserId(null);
      setSubscriptionMonths("1");
      Alert.alert("Success", `Subscription extended by ${months} month(s)`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to extend subscription");
    }
  };

  const refetchAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analyticsQuery.refetch();
    usersQuery.refetch();
    storiesQuery.refetch();
    settingsQuery.refetch();
    apiKeysQuery.refetch();
    logsQuery.refetch();
  };

  const filterUsers = (users: any[]) => {
    let filtered = users;
    
    if (userFilter === "premium") {
      filtered = filtered.filter((u) => u.isPremium && !u.isAdmin);
    } else if (userFilter === "free") {
      filtered = filtered.filter((u) => !u.isPremium && !u.isAdmin);
    } else if (userFilter === "admin") {
      filtered = filtered.filter((u) => u.isAdmin);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const renderAnalytics = () => {
    const data = analyticsQuery.data;
    if (!data) return null;

    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - 40;

    const storiesData = Object.entries(data.storiesPerDay)
      .slice(-7)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count: count as number,
      }));

    const lineChartData = {
      labels: storiesData.map((d) => d.date),
      datasets: [
        {
          data: storiesData.map((d) => d.count),
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    const pieChartData = [
      {
        name: "Premium",
        population: data.premiumUsers,
        color: "#F39C12",
        legendFontColor: "#7F8C8D",
        legendFontSize: 14,
      },
      {
        name: "Free",
        population: data.freeUsers,
        color: "#4A90E2",
        legendFontColor: "#7F8C8D",
        legendFontSize: 14,
      },
    ];

    return (
      <View>
        <View style={styles.analyticsHeader}>
          <View>
            <Text style={styles.sectionTitle}>Platform Analytics</Text>
            <Text style={styles.sectionSubtitle}>Real-time insights and metrics</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={refetchAll}>
            <RefreshCw size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Time Period:</Text>
          <View style={styles.filterButtons}>
            {(["7d", "30d", "90d", "all"] as DateFilter[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  dateFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDateFilter(filter);
                }}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    dateFilter === filter && styles.filterButtonTextActive,
                  ]}
                >
                  {filter === "7d" ? "7 Days" : filter === "30d" ? "30 Days" : filter === "90d" ? "90 Days" : "All Time"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: "#E8F4FD" }]}>
            <Users size={32} color="#4A90E2" />
            <Text style={styles.statValue}>{data.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#FFF9E6" }]}>
            <Crown size={32} color="#F39C12" />
            <Text style={styles.statValue}>{data.premiumUsers}</Text>
            <Text style={styles.statLabel}>Premium Users</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#E8F8F5" }]}>
            <BookOpen size={32} color="#27AE60" />
            <Text style={styles.statValue}>{data.totalStories}</Text>
            <Text style={styles.statLabel}>Stories Created</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#F4ECF7" }]}>
            <TrendingUp size={32} color="#6C5CE7" />
            <Text style={styles.statValue}>{data.averageStoriesPerUser}</Text>
            <Text style={styles.statLabel}>Avg Per User</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Breakdown</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Free Users</Text>
              <Text style={styles.breakdownValue}>{data.freeUsers}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Premium Users</Text>
              <Text style={styles.breakdownValue}>{data.premiumUsers}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Conversion Rate</Text>
              <Text style={styles.breakdownValue}>
                {data.totalUsers > 0
                  ? ((data.premiumUsers / data.totalUsers) * 100).toFixed(1)
                  : 0}
                %
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Stories</Text>
          {data.recentStories.map((story: any) => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyCard}
              onPress={() => router.push(`/story/${story.id}` as any)}
            >
              <Text style={styles.storyCardTitle}>{story.childName}&apos;s Story</Text>
              <Text style={styles.storyCardSituation} numberOfLines={2}>
                {story.situation}
              </Text>
              <Text style={styles.storyCardDate}>
                {new Date(story.createdAt).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stories Created (Last 7 Days)</Text>
          {storiesData.length > 0 && storiesData.some((d) => d.count > 0) ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={lineChartData}
                width={Math.max(chartWidth, storiesData.length * 60)}
                height={220}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(127, 140, 141, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#4A90E2",
                  },
                }}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>No data available</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Distribution</Text>
          {data.totalUsers > 0 ? (
            <PieChart
              data={pieChartData}
              width={chartWidth}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>No users yet</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderUsers = () => {
    const users = usersQuery.data;
    if (!users) return null;

    const filteredUsers = filterUsers(users);

    return (
      <View>
        <View style={styles.analyticsHeader}>
          <View>
            <Text style={styles.sectionTitle}>User Management</Text>
            <Text style={styles.sectionSubtitle}>{filteredUsers.length} of {users.length} users</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#A0AEC0" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or email..."
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <View style={styles.filterContainer}>
          <Filter size={18} color="#718096" />
          <View style={styles.filterButtons}>
            {(["all", "premium", "free", "admin"] as UserFilter[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  userFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setUserFilter(filter);
                }}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    userFilter === filter && styles.filterButtonTextActive,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {filteredUsers.map((u: any) => (
          <View key={u.id} style={styles.userCard}>
            <View style={styles.userCardHeader}>
              <View>
                <Text style={styles.userCardName}>{u.name}</Text>
                <Text style={styles.userCardEmail}>{u.email}</Text>
              </View>
              <View style={styles.userBadges}>
                {u.isPremium && (
                  <View style={styles.premiumBadgeSmall}>
                    <Crown size={12} color="#F39C12" />
                  </View>
                )}
                {u.isAdmin && (
                  <View style={styles.adminBadgeSmall}>
                    <Shield size={12} color="#6C5CE7" />
                  </View>
                )}
              </View>
            </View>
            <View style={styles.userCardInfo}>
              <Text style={styles.userCardInfoText}>Stories: {u.storiesGenerated}</Text>
              <Text style={styles.userCardInfoText}>•</Text>
              <Text style={styles.userCardInfoText}>
                Joined: {new Date(u.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.userCardActions}>
              <TouchableOpacity
                style={[styles.userActionButton, u.isPremium && styles.userActionButtonActive]}
                onPress={() => handleTogglePremium(u.id)}
              >
                <Crown size={16} color={u.isPremium ? "#F39C12" : "#95A5A6"} />
                <Text style={styles.userActionButtonText}>
                  {u.isPremium ? "Remove Premium" : "Make Premium"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.userActionButton, u.isAdmin && styles.userActionButtonActive]}
                onPress={() => handleToggleAdmin(u.id)}
              >
                <Shield size={16} color={u.isAdmin ? "#6C5CE7" : "#95A5A6"} />
                <Text style={styles.userActionButtonText}>
                  {u.isAdmin ? "Remove Admin" : "Make Admin"}
                </Text>
              </TouchableOpacity>
              {u.id !== user?.userId && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(u.id, u.name)}
                >
                  <Trash2 size={16} color="#E74C3C" />
                </TouchableOpacity>
              )}
            </View>
            {selectedUserId === u.id && (
              <View style={styles.expandedActions}>
                <View style={styles.actionSection}>
                  <Text style={styles.actionSectionTitle}>Extend Subscription</Text>
                  <View style={styles.actionRow}>
                    <TextInput
                      style={styles.smallInput}
                      value={subscriptionMonths}
                      onChangeText={setSubscriptionMonths}
                      placeholder="Months"
                      keyboardType="number-pad"
                    />
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleExtendSubscription(u.id)}
                    >
                      <Calendar size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Extend</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            {passwordResetUserId === u.id && (
              <View style={styles.expandedActions}>
                <View style={styles.actionSection}>
                  <Text style={styles.actionSectionTitle}>Reset Password</Text>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPasswordForUser}
                    onChangeText={setNewPasswordForUser}
                    placeholder="New password (min 6 characters)"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry
                  />
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleResetPassword(u.id)}
                    >
                      <Text style={styles.actionButtonText}>Reset Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton2}
                      onPress={() => {
                        setPasswordResetUserId(null);
                        setNewPasswordForUser("");
                      }}
                    >
                      <Text style={styles.cancelButtonText2}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            <View style={styles.moreActionsRow}>
              <TouchableOpacity
                style={styles.moreActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedUserId(selectedUserId === u.id ? null : u.id);
                  setPasswordResetUserId(null);
                }}
              >
                <Text style={styles.moreActionButtonText}>
                  {selectedUserId === u.id ? "Hide" : "Manage Subscription"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.moreActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPasswordResetUserId(passwordResetUserId === u.id ? null : u.id);
                  setSelectedUserId(null);
                }}
              >
                <Text style={styles.moreActionButtonText}>
                  {passwordResetUserId === u.id ? "Hide" : "Reset Password"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderStories = () => {
    const stories = storiesQuery.data;
    if (!stories) return null;

    return (
      <View>
        <Text style={styles.sectionTitle}>All Stories</Text>
        <Text style={styles.sectionSubtitle}>{stories.length} total stories</Text>
        {stories.map((story: any) => (
          <View key={story.id} style={styles.storyCardAdmin}>
            <View style={styles.storyCardAdminHeader}>
              <View style={styles.flex1}>
                <Text style={styles.storyCardTitle}>{story.childName}&apos;s Story</Text>
                <Text style={styles.storyCardSituation} numberOfLines={2}>
                  {story.situation}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteStory(story.id)}
              >
                <Trash2 size={18} color="#E74C3C" />
              </TouchableOpacity>
            </View>
            <View style={styles.storyCardMeta}>
              <Text style={styles.storyCardMetaText}>Complexity: {story.complexity}</Text>
              <Text style={styles.storyCardMetaText}>•</Text>
              <Text style={styles.storyCardMetaText}>Tone: {story.tone}</Text>
              <Text style={styles.storyCardMetaText}>•</Text>
              <Text style={styles.storyCardMetaText}>
                {new Date(story.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewStoryButton}
              onPress={() => router.push(`/story/${story.id}` as any)}
            >
              <Text style={styles.viewStoryButtonText}>View Story</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderSettings = () => {
    const settings = settingsQuery.data;
    if (!settings) return null;

    return (
      <View>
        <Text style={styles.sectionTitle}>Platform Settings</Text>
        <Text style={styles.sectionSubtitle}>Configure app behavior</Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Free Story Limit</Text>
              <Text style={styles.settingDescription}>Number of free stories per user</Text>
            </View>
            <TextInput
              style={styles.settingInput}
              value={settings.freeStoryLimit.toString()}
              onChangeText={(value) => {
                const num = parseInt(value) || 0;
                handleUpdateSettings({ freeStoryLimit: num });
              }}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Premium Price</Text>
              <Text style={styles.settingDescription}>Monthly subscription price (USD)</Text>
            </View>
            <TextInput
              style={styles.settingInput}
              value={settings.premiumPrice.toFixed(2)}
              onChangeText={(value) => {
                const num = parseFloat(value) || 0;
                handleUpdateSettings({ premiumPrice: num });
              }}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Registration</Text>
              <Text style={styles.settingDescription}>Allow new users to register</Text>
            </View>
            <Switch
              value={settings.enableRegistration}
              onValueChange={(value) => handleUpdateSettings({ enableRegistration: value })}
              trackColor={{ false: "#E1E8ED", true: "#4A90E2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Maintenance Mode</Text>
              <Text style={styles.settingDescription}>Restrict access to admins only</Text>
            </View>
            <Switch
              value={settings.maintenanceMode}
              onValueChange={(value) => handleUpdateSettings({ maintenanceMode: value })}
              trackColor={{ false: "#E1E8ED", true: "#E74C3C" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    );
  };

  const renderApiKeys = () => {
    const apiKeys = apiKeysQuery.data;
    if (!apiKeys) return null;

    return (
      <View>
        <Text style={styles.sectionTitle}>API Keys Management</Text>
        <Text style={styles.sectionSubtitle}>Configure third-party integrations</Text>

        <View style={styles.settingsCard}>
          <View style={styles.apiKeySection}>
            <Text style={styles.apiKeyTitle}>OpenAI API Key</Text>
            <Text style={styles.apiKeyDescription}>For AI story and image generation</Text>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeys.openaiKey}
              onChangeText={(value) => handleUpdateApiKey("openaiKey", value)}
              placeholder="sk-..."
              placeholderTextColor="#BDC3C7"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.apiKeySection}>
            <Text style={styles.apiKeyTitle}>Google Gemini API Key</Text>
            <Text style={styles.apiKeyDescription}>Alternative AI provider for story generation</Text>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeys.geminiKey}
              onChangeText={(value) => handleUpdateApiKey("geminiKey", value)}
              placeholder="AIza..."
              placeholderTextColor="#BDC3C7"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.apiKeySection}>
            <Text style={styles.apiKeyTitle}>Stripe Secret Key</Text>
            <Text style={styles.apiKeyDescription}>For payment processing</Text>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeys.stripeSecretKey}
              onChangeText={(value) => handleUpdateApiKey("stripeSecretKey", value)}
              placeholder="sk_live_... or sk_test_..."
              placeholderTextColor="#BDC3C7"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.apiKeySection}>
            <Text style={styles.apiKeyTitle}>Stripe Publishable Key</Text>
            <Text style={styles.apiKeyDescription}>For client-side payment forms</Text>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeys.stripePublishableKey}
              onChangeText={(value) => handleUpdateApiKey("stripePublishableKey", value)}
              placeholder="pk_live_... or pk_test_..."
              placeholderTextColor="#BDC3C7"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.apiKeySection}>
            <Text style={styles.apiKeyTitle}>Google OAuth Client ID (Web)</Text>
            <Text style={styles.apiKeyDescription}>For Google Sign-In on web</Text>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeys.googleOAuthWebClientId}
              onChangeText={(value) => handleUpdateApiKey("googleOAuthWebClientId", value)}
              placeholder="xxxxx.apps.googleusercontent.com"
              placeholderTextColor="#BDC3C7"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.apiKeySection}>
            <Text style={styles.apiKeyTitle}>Google OAuth Client ID (iOS)</Text>
            <Text style={styles.apiKeyDescription}>For Google Sign-In on iOS</Text>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeys.googleOAuthIosClientId}
              onChangeText={(value) => handleUpdateApiKey("googleOAuthIosClientId", value)}
              placeholder="xxxxx.apps.googleusercontent.com"
              placeholderTextColor="#BDC3C7"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.apiKeySection}>
            <Text style={styles.apiKeyTitle}>Google OAuth Client ID (Android)</Text>
            <Text style={styles.apiKeyDescription}>For Google Sign-In on Android</Text>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeys.googleOAuthAndroidClientId}
              onChangeText={(value) => handleUpdateApiKey("googleOAuthAndroidClientId", value)}
              placeholder="xxxxx.apps.googleusercontent.com"
              placeholderTextColor="#BDC3C7"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>📋 Google OAuth Setup Guide</Text>
          <Text style={styles.infoBoxText}>
            1. Go to Google Cloud Console (console.cloud.google.com)
          </Text>
          <Text style={styles.infoBoxText}>
            2. Create a new project or select existing one
          </Text>
          <Text style={styles.infoBoxText}>
            3. Enable Google+ API
          </Text>
          <Text style={styles.infoBoxText}>
            4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
          </Text>
          <Text style={styles.infoBoxText}>
            5. For iOS: Application type = iOS, Bundle ID from app.json
          </Text>
          <Text style={styles.infoBoxText}>
            6. For Android: Application type = Android, Package name from app.json, SHA-1 certificate fingerprint
          </Text>
          <Text style={styles.infoBoxText}>
            7. For Web: Application type = Web application
          </Text>
        </View>
      </View>
    );
  };

  const renderLogs = () => {
    const logs = logsQuery.data;
    if (!logs) return null;

    return (
      <View>
        <Text style={styles.sectionTitle}>Activity Logs</Text>
        <Text style={styles.sectionSubtitle}>Recent admin actions</Text>
        {logs.length === 0 && (
          <View style={styles.emptyState}>
            <Activity size={48} color="#BDC3C7" />
            <Text style={styles.emptyStateText}>No activity yet</Text>
          </View>
        )}
        {logs.map((log: any) => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logCardHeader}>
              <Text style={styles.logCardAction}>{log.action.replace(/_/g, ' ').toUpperCase()}</Text>
              <Text style={styles.logCardTime}>
                {new Date(log.timestamp).toLocaleString()}
              </Text>
            </View>
            <Text style={styles.logCardDetails}>{log.details}</Text>
            <Text style={styles.logCardUser}>by {log.userName} ({log.userEmail})</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderContacts = () => {
    const contacts = contactsQuery.data;
    if (!contacts) return null;

    const pendingContacts = contacts.filter((c: any) => c.status === 'pending');
    const inProgressContacts = contacts.filter((c: any) => c.status === 'in-progress');
    const resolvedContacts = contacts.filter((c: any) => c.status === 'resolved');

    const handleUpdateStatus = async (id: string, status: 'pending' | 'in-progress' | 'resolved') => {
      try {
        await updateContactStatusMutation.mutateAsync({ id, status });
        contactsQuery.refetch();
        Alert.alert("Success", "Status updated");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to update status");
      }
    };

    const handleDeleteContact = async (id: string) => {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this contact request?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteContactMutation.mutateAsync({ id });
                contactsQuery.refetch();
                Alert.alert("Success", "Contact request deleted");
              } catch (error: any) {
                Alert.alert("Error", error.message || "Failed to delete");
              }
            },
          },
        ]
      );
    };

    const handleReply = async (id: string) => {
      if (!replyText.trim()) {
        Alert.alert("Error", "Please enter a reply message");
        return;
      }

      try {
        await replyContactMutation.mutateAsync({ id, reply: replyText.trim() });
        contactsQuery.refetch();
        setSelectedContactId(null);
        setReplyText("");
        Alert.alert("Success", "Reply sent successfully");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to send reply");
      }
    };

    const renderContactCard = (contact: any) => (
      <View key={contact.id} style={styles.contactCard}>
        <View style={styles.contactCardHeader}>
          <View style={styles.flex1}>
            <Text style={styles.contactCardName}>{contact.name}</Text>
            <Text style={styles.contactCardEmail}>{contact.email}</Text>
          </View>
          <View style={[
            styles.contactStatusBadge,
            contact.status === 'resolved' && styles.contactStatusResolved,
            contact.status === 'in-progress' && styles.contactStatusInProgress,
          ]}>
            <Text style={styles.contactStatusText}>{contact.status}</Text>
          </View>
        </View>

        <Text style={styles.contactCardSubject}>{contact.subject}</Text>
        <Text style={styles.contactCardMessage} numberOfLines={3}>{contact.message}</Text>
        <Text style={styles.contactCardDate}>
          {new Date(contact.createdAt).toLocaleString()}
        </Text>

        {contact.adminReply && (
          <View style={styles.replySection}>
            <Text style={styles.replySectionTitle}>Admin Reply:</Text>
            <Text style={styles.replyText}>{contact.adminReply}</Text>
            <Text style={styles.replyDate}>
              Replied: {new Date(contact.repliedAt).toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.contactActions}>
          {['pending', 'in-progress', 'resolved'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                contact.status === status && styles.statusButtonActive,
              ]}
              onPress={() => handleUpdateStatus(contact.id, status as any)}
            >
              <Text style={[
                styles.statusButtonText,
                contact.status === status && styles.statusButtonTextActive,
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedContactId !== contact.id && !contact.adminReply && (
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => setSelectedContactId(contact.id)}
          >
            <Text style={styles.replyButtonText}>Reply via Email</Text>
          </TouchableOpacity>
        )}

        {selectedContactId === contact.id && (
          <View style={styles.replyForm}>
            <TextInput
              style={styles.replyInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Type your reply..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.replyFormActions}>
              <TouchableOpacity
                style={styles.sendReplyButton}
                onPress={() => handleReply(contact.id)}
              >
                <Text style={styles.sendReplyButtonText}>Send Email Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelReplyButton}
                onPress={() => {
                  setSelectedContactId(null);
                  setReplyText("");
                }}
              >
                <Text style={styles.cancelReplyButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteContactButton}
          onPress={() => handleDeleteContact(contact.id)}
        >
          <Trash2 size={16} color="#E74C3C" />
          <Text style={styles.deleteContactButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <View>
        <Text style={styles.sectionTitle}>Contact Requests</Text>
        <Text style={styles.sectionSubtitle}>{contacts.length} total requests</Text>

        {pendingContacts.length > 0 && (
          <View style={styles.contactSection}>
            <Text style={styles.contactSectionTitle}>Pending ({pendingContacts.length})</Text>
            {pendingContacts.map(renderContactCard)}
          </View>
        )}

        {inProgressContacts.length > 0 && (
          <View style={styles.contactSection}>
            <Text style={styles.contactSectionTitle}>In Progress ({inProgressContacts.length})</Text>
            {inProgressContacts.map(renderContactCard)}
          </View>
        )}

        {resolvedContacts.length > 0 && (
          <View style={styles.contactSection}>
            <Text style={styles.contactSectionTitle}>Resolved ({resolvedContacts.length})</Text>
            {resolvedContacts.map(renderContactCard)}
          </View>
        )}

        {contacts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No contact requests yet</Text>
          </View>
        )}
      </View>
    );
  };

  const renderMail = () => {
    const config = mailConfigQuery.data;
    if (!config) return null;

    const handleUpdateMailConfig = async () => {
      try {
        await updateMailConfigMutation.mutateAsync(mailConfig);
        mailConfigQuery.refetch();
        Alert.alert("Success", "Mail configuration updated");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to update mail config");
      }
    };

    const handleTestConnection = async () => {
      try {
        const result = await testMailMutation.mutateAsync();
        if (result.success) {
          Alert.alert("Success", "Mail server connection successful!");
        } else {
          Alert.alert("Error", "Failed to connect to mail server. Check your settings.");
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to test connection");
      }
    };

    return (
      <View>
        <Text style={styles.sectionTitle}>Mail Server Configuration</Text>
        <Text style={styles.sectionSubtitle}>Configure SMTP settings for email notifications</Text>

        <View style={styles.settingsCard}>
          <View style={styles.mailFieldSection}>
            <Text style={styles.mailFieldLabel}>SMTP Host</Text>
            <TextInput
              style={styles.mailFieldInput}
              value={mailConfig.host}
              onChangeText={(value) => setMailConfig({ ...mailConfig, host: value })}
              placeholder="smtp.gmail.com"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.mailFieldSection}>
            <Text style={styles.mailFieldLabel}>SMTP Port</Text>
            <TextInput
              style={styles.mailFieldInput}
              value={mailConfig.port.toString()}
              onChangeText={(value) => setMailConfig({ ...mailConfig, port: parseInt(value) || 587 })}
              placeholder="587"
              placeholderTextColor="#A0AEC0"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Use SSL/TLS</Text>
              <Text style={styles.settingDescription}>Enable secure connection</Text>
            </View>
            <Switch
              value={mailConfig.secure}
              onValueChange={(value) => setMailConfig({ ...mailConfig, secure: value })}
              trackColor={{ false: "#E1E8ED", true: "#4A90E2" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.mailFieldSection}>
            <Text style={styles.mailFieldLabel}>SMTP Username</Text>
            <TextInput
              style={styles.mailFieldInput}
              value={mailConfig.user}
              onChangeText={(value) => setMailConfig({ ...mailConfig, user: value })}
              placeholder="your-email@gmail.com"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.mailFieldSection}>
            <Text style={styles.mailFieldLabel}>SMTP Password</Text>
            <TextInput
              style={styles.mailFieldInput}
              value={mailConfig.password}
              onChangeText={(value) => setMailConfig({ ...mailConfig, password: value })}
              placeholder="App password or account password"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.mailFieldSection}>
            <Text style={styles.mailFieldLabel}>From Email</Text>
            <TextInput
              style={styles.mailFieldInput}
              value={mailConfig.fromEmail}
              onChangeText={(value) => setMailConfig({ ...mailConfig, fromEmail: value })}
              placeholder="noreply@socialstoryai.com"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.mailFieldSection}>
            <Text style={styles.mailFieldLabel}>From Name</Text>
            <TextInput
              style={styles.mailFieldInput}
              value={mailConfig.fromName}
              onChangeText={(value) => setMailConfig({ ...mailConfig, fromName: value })}
              placeholder="SocialStoryAI"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>

        <View style={styles.mailActions}>
          <TouchableOpacity
            style={styles.saveMailButton}
            onPress={handleUpdateMailConfig}
          >
            <Text style={styles.saveMailButtonText}>Save Configuration</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testMailButton}
            onPress={handleTestConnection}
            disabled={testMailMutation.isPending}
          >
            <Text style={styles.testMailButtonText}>
              {testMailMutation.isPending ? "Testing..." : "Test Connection"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>📧 Email Setup Guide</Text>
          <Text style={styles.infoBoxText}>
            For Gmail: Use an App Password (not your account password)
          </Text>
          <Text style={styles.infoBoxText}>
            1. Enable 2-factor authentication on your Google account
          </Text>
          <Text style={styles.infoBoxText}>
            2. Go to: myaccount.google.com/apppasswords
          </Text>
          <Text style={styles.infoBoxText}>
            3. Generate an App Password for &quot;Mail&quot;
          </Text>
          <Text style={styles.infoBoxText}>
            4. Use that 16-character password here
          </Text>
          <Text style={styles.infoBoxText}>
            Host: smtp.gmail.com, Port: 587, Secure: Off
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Full platform control</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "analytics" && styles.tabActive]}
          onPress={() => setActiveTab("analytics")}
        >
          <BarChart3 size={20} color={activeTab === "analytics" ? "#4A90E2" : "#95A5A6"} />
          <Text style={[styles.tabText, activeTab === "analytics" && styles.tabTextActive]}>
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "users" && styles.tabActive]}
          onPress={() => setActiveTab("users")}
        >
          <Users size={20} color={activeTab === "users" ? "#4A90E2" : "#95A5A6"} />
          <Text style={[styles.tabText, activeTab === "users" && styles.tabTextActive]}>
            Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "stories" && styles.tabActive]}
          onPress={() => setActiveTab("stories")}
        >
          <BookOpen size={20} color={activeTab === "stories" ? "#4A90E2" : "#95A5A6"} />
          <Text style={[styles.tabText, activeTab === "stories" && styles.tabTextActive]}>
            Stories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.tabActive]}
          onPress={() => setActiveTab("settings")}
        >
          <SettingsIcon size={20} color={activeTab === "settings" ? "#4A90E2" : "#95A5A6"} />
          <Text style={[styles.tabText, activeTab === "settings" && styles.tabTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "logs" && styles.tabActive]}
          onPress={() => setActiveTab("logs")}
        >
          <Activity size={20} color={activeTab === "logs" ? "#4A90E2" : "#95A5A6"} />
          <Text style={[styles.tabText, activeTab === "logs" && styles.tabTextActive]}>
            Logs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "api-keys" && styles.tabActive]}
          onPress={() => setActiveTab("api-keys")}
        >
          <Key size={20} color={activeTab === "api-keys" ? "#4A90E2" : "#95A5A6"} />
          <Text style={[styles.tabText, activeTab === "api-keys" && styles.tabTextActive]}>
            Keys
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.secondaryTabBar}>
        <TouchableOpacity
          style={[styles.secondaryTab, activeTab === "contacts" && styles.secondaryTabActive]}
          onPress={() => setActiveTab("contacts")}
        >
          <Text style={[styles.secondaryTabText, activeTab === "contacts" && styles.secondaryTabTextActive]}>
            Contact Requests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryTab, activeTab === "mail" && styles.secondaryTabActive]}
          onPress={() => setActiveTab("mail")}
        >
          <Text style={[styles.secondaryTabText, activeTab === "mail" && styles.secondaryTabTextActive]}>
            Mail Config
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryTab, activeTab === "content" && styles.secondaryTabActive]}
          onPress={() => router.push("/content-editor" as any)}
        >
          <Text style={[styles.secondaryTabText, activeTab === "content" && styles.secondaryTabTextActive]}>
            Content Editor
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "stories" && renderStories()}
        {activeTab === "settings" && renderSettings()}
        {activeTab === "logs" && renderLogs()}
        {activeTab === "api-keys" && renderApiKeys()}
        {activeTab === "contacts" && renderContacts()}
        {activeTab === "mail" && renderMail()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    gap: 4,
  },
  tabActive: {
    backgroundColor: "#E8F4FD",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#95A5A6",
  },
  tabTextActive: {
    color: "#4A90E2",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    fontSize: 16,
    color: "#7F8C8D",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },
  errorText: {
    fontSize: 18,
    color: "#E74C3C",
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#1A202C",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#A0AEC0",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#2C3E50",
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  breakdownLabel: {
    fontSize: 16,
    color: "#5D6D7E",
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#2C3E50",
  },
  storyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  storyCardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#2C3E50",
    marginBottom: 4,
  },
  storyCardSituation: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 8,
  },
  storyCardDate: {
    fontSize: 12,
    color: "#BDC3C7",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    width: 80,
  },
  chartBar: {
    flex: 1,
    height: 24,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  chartBarFill: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 12,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2C3E50",
    width: 40,
    textAlign: "right",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyChart: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  emptyChartText: {
    fontSize: 14,
    color: "#A0AEC0",
  },
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F4FD",
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#718096",
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterButtonActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#718096",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A202C",
  },
  expandedActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionSection: {
    marginBottom: 12,
  },
  actionSectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#4A5568",
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  smallInput: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  passwordInput: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  cancelButton2: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText2: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#718096",
  },
  moreActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  moreActionButton: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  moreActionButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#4A90E2",
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  userCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userCardName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 2,
  },
  userCardEmail: {
    fontSize: 14,
    color: "#718096",
  },
  userBadges: {
    flexDirection: "row",
    gap: 6,
  },
  premiumBadgeSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF9E6",
    alignItems: "center",
    justifyContent: "center",
  },
  adminBadgeSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F4ECF7",
    alignItems: "center",
    justifyContent: "center",
  },
  userCardInfo: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  userCardInfoText: {
    fontSize: 13,
    color: "#A0AEC0",
  },
  userCardActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  userActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  userActionButtonActive: {
    backgroundColor: "#E8F4FD",
    borderColor: "#4A90E2",
  },
  userActionButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#4A5568",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  storyCardAdmin: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  storyCardAdminHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  storyCardMeta: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  storyCardMetaText: {
    fontSize: 12,
    color: "#A0AEC0",
  },
  viewStoryButton: {
    backgroundColor: "#E8F4FD",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  viewStoryButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#4A90E2",
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A202C",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#A0AEC0",
  },
  settingInput: {
    width: 80,
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A202C",
    borderWidth: 1,
    borderColor: "#E1E8ED",
    textAlign: "center",
  },
  logCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E1E8ED",
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },
  logCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logCardAction: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#4A90E2",
    letterSpacing: 0.5,
  },
  logCardTime: {
    fontSize: 11,
    color: "#A0AEC0",
  },
  logCardDetails: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 6,
  },
  logCardUser: {
    fontSize: 12,
    color: "#A0AEC0",
    fontStyle: "italic" as const,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#BDC3C7",
    marginTop: 16,
  },
  apiKeySection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  apiKeyTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 4,
  },
  apiKeyDescription: {
    fontSize: 13,
    color: "#A0AEC0",
    marginBottom: 12,
  },
  apiKeyInput: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: "#1A202C",
    borderWidth: 1,
    borderColor: "#E1E8ED",
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1A202C",
    marginBottom: 12,
  },
  infoBoxText: {
    fontSize: 13,
    color: "#4A5568",
    lineHeight: 20,
    marginBottom: 6,
  },
  secondaryTabBar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8ED",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  secondaryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryTabActive: {
    backgroundColor: "#E8F4FD",
    borderColor: "#4A90E2",
  },
  secondaryTabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#718096",
  },
  secondaryTabTextActive: {
    color: "#4A90E2",
  },
  contactSection: {
    marginBottom: 24,
  },
  contactSectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1A202C",
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  contactCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  contactCardName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A202C",
    marginBottom: 4,
  },
  contactCardEmail: {
    fontSize: 14,
    color: "#718096",
  },
  contactStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#FFF9E6",
  },
  contactStatusResolved: {
    backgroundColor: "#E8F8F5",
  },
  contactStatusInProgress: {
    backgroundColor: "#E8F4FD",
  },
  contactStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1A202C",
    textTransform: "capitalize" as const,
  },
  contactCardSubject: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#2C3E50",
    marginBottom: 8,
  },
  contactCardMessage: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 8,
    lineHeight: 20,
  },
  contactCardDate: {
    fontSize: 12,
    color: "#BDC3C7",
    marginBottom: 12,
  },
  replySection: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  replySectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#4A5568",
    marginBottom: 8,
  },
  replyText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
    marginBottom: 8,
  },
  replyDate: {
    fontSize: 12,
    color: "#A0AEC0",
  },
  contactActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#718096",
    textTransform: "capitalize" as const,
  },
  statusButtonTextActive: {
    color: "#FFFFFF",
  },
  replyButton: {
    backgroundColor: "#E8F4FD",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  replyButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#4A90E2",
  },
  replyForm: {
    marginBottom: 12,
  },
  replyInput: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1A202C",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 100,
    marginBottom: 12,
  },
  replyFormActions: {
    flexDirection: "row",
    gap: 8,
  },
  sendReplyButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  sendReplyButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  cancelReplyButton: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelReplyButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#718096",
  },
  deleteContactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  deleteContactButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#E74C3C",
  },
  mailFieldSection: {
    marginBottom: 16,
  },
  mailFieldLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1A202C",
    marginBottom: 8,
  },
  mailFieldInput: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1A202C",
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  mailActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  saveMailButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  saveMailButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  testMailButton: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  testMailButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#4A90E2",
  },
});
