import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, ScrollView, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  BookOpen, 
  Crown, 
  Settings, 
  Info, 
  Shield, 
  FileText, 
  Mail, 
  HelpCircle,
  LogOut,
  User,
  X,
  Plus,
  ChevronRight
} from "lucide-react-native";
import React, { useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.82, 320);

type MenuDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

export function MenuDrawer({ visible, onClose }: MenuDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, scaleAnim]);

  const handleNavigate = (path: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
    setTimeout(() => router.push(path as any), 250);
  };

  const handleLogout = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onClose();
    await logout();
    router.replace("/");
  };

  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/home") return true;
    if (path !== "/home" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View style={[styles.overlayBg, { opacity: fadeAnim }]} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [
                { translateX: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isAuthenticated && user && (
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
              </View>
              {user.isPremium && (
                <View style={styles.premiumBadge}>
                  <Crown size={14} color="#F59E0B" />
                  <Text style={styles.premiumText}>PRO</Text>
                </View>
              )}
            </View>
          )}

          <ScrollView 
            style={styles.menuItems} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuContent}
          >
            {isAuthenticated ? (
              <>
                <View style={styles.menuSection}>
                  <Text style={styles.sectionLabel}>MAIN</Text>
                  <MenuItem
                    icon={<Home size={20} color={isActive("/home") ? "#3B82F6" : "#64748B"} />}
                    label="Home"
                    active={isActive("/home")}
                    onPress={() => handleNavigate("/home")}
                  />
                  <MenuItem
                    icon={<Plus size={20} color={isActive("/create-story") ? "#3B82F6" : "#64748B"} />}
                    label="Create Story"
                    active={isActive("/create-story")}
                    onPress={() => handleNavigate("/create-story")}
                  />
                  <MenuItem
                    icon={<BookOpen size={20} color={isActive("/my-stories") ? "#3B82F6" : "#64748B"} />}
                    label="My Stories"
                    active={isActive("/my-stories")}
                    onPress={() => handleNavigate("/my-stories")}
                  />
                </View>

                <View style={styles.menuSection}>
                  <Text style={styles.sectionLabel}>ACCOUNT</Text>
                  {!user?.isPremium && (
                    <MenuItem
                      icon={<Crown size={20} color="#F59E0B" />}
                      label="Upgrade to Premium"
                      onPress={() => handleNavigate("/pricing")}
                      highlight
                    />
                  )}
                  <MenuItem
                    icon={<Settings size={20} color={isActive("/settings") ? "#3B82F6" : "#64748B"} />}
                    label="Settings"
                    active={isActive("/settings")}
                    onPress={() => handleNavigate("/settings")}
                  />
                </View>

                <View style={styles.menuSection}>
                  <Text style={styles.sectionLabel}>INFO</Text>
                  <MenuItem
                    icon={<Info size={20} color={isActive("/about") ? "#3B82F6" : "#64748B"} />}
                    label="About Social Stories"
                    active={isActive("/about")}
                    onPress={() => handleNavigate("/about")}
                  />
                  <MenuItem
                    icon={<Mail size={20} color={isActive("/contact") ? "#3B82F6" : "#64748B"} />}
                    label="Contact Us"
                    active={isActive("/contact")}
                    onPress={() => handleNavigate("/contact")}
                  />
                  <MenuItem
                    icon={<HelpCircle size={20} color={isActive("/faq") ? "#3B82F6" : "#64748B"} />}
                    label="FAQ"
                    active={isActive("/faq")}
                    onPress={() => handleNavigate("/faq")}
                  />
                </View>

                <View style={styles.menuSection}>
                  <Text style={styles.sectionLabel}>LEGAL</Text>
                  <MenuItem
                    icon={<FileText size={20} color={isActive("/terms") ? "#3B82F6" : "#64748B"} />}
                    label="Terms of Service"
                    active={isActive("/terms")}
                    onPress={() => handleNavigate("/terms")}
                  />
                  <MenuItem
                    icon={<Shield size={20} color={isActive("/privacy") ? "#3B82F6" : "#64748B"} />}
                    label="Privacy Policy"
                    active={isActive("/privacy")}
                    onPress={() => handleNavigate("/privacy")}
                  />
                </View>

                {user?.isAdmin && (
                  <View style={styles.menuSection}>
                    <Text style={styles.sectionLabel}>ADMIN</Text>
                    <MenuItem
                      icon={<Shield size={20} color="#EF4444" />}
                      label="Admin Dashboard"
                      active={isActive("/admin")}
                      onPress={() => handleNavigate("/admin")}
                      admin
                    />
                  </View>
                )}

                <View style={styles.logoutSection}>
                  <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.menuSection}>
                  <MenuItem
                    icon={<Home size={20} color={isActive("/") ? "#3B82F6" : "#64748B"} />}
                    label="Home"
                    active={pathname === "/"}
                    onPress={() => handleNavigate("/")}
                  />
                  <MenuItem
                    icon={<Info size={20} color={isActive("/about") ? "#3B82F6" : "#64748B"} />}
                    label="About"
                    active={isActive("/about")}
                    onPress={() => handleNavigate("/about")}
                  />
                  <MenuItem
                    icon={<Crown size={20} color={isActive("/pricing") ? "#3B82F6" : "#64748B"} />}
                    label="Pricing"
                    active={isActive("/pricing")}
                    onPress={() => handleNavigate("/pricing")}
                  />
                  <MenuItem
                    icon={<HelpCircle size={20} color={isActive("/faq") ? "#3B82F6" : "#64748B"} />}
                    label="FAQ"
                    active={isActive("/faq")}
                    onPress={() => handleNavigate("/faq")}
                  />
                </View>

                <View style={styles.authSection}>
                  <TouchableOpacity 
                    style={styles.signInButton}
                    onPress={() => handleNavigate("/auth")}
                  >
                    <User size={20} color="#FFFFFF" />
                    <Text style={styles.signInText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.drawerFooter}>
            <Text style={styles.footerText}>SocialStoryAI</Text>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
  highlight?: boolean;
  admin?: boolean;
};

function MenuItem({ icon, label, onPress, active, highlight, admin }: MenuItemProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.menuItem, 
        active && styles.menuItemActive,
        highlight && styles.menuItemHighlight,
        admin && styles.menuItemAdmin,
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuItemIcon, active && styles.menuItemIconActive]}>
          {icon}
        </View>
        <Text style={[
          styles.menuItemLabel, 
          active && styles.menuItemLabelActive,
          highlight && styles.menuItemLabelHighlight,
        ]}>
          {label}
        </Text>
      </View>
      <ChevronRight size={18} color={active ? "#3B82F6" : "#CBD5E1"} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBg: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  userDetails: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#0F172A",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#64748B",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: "#D97706",
    letterSpacing: 0.5,
  },
  menuItems: {
    flex: 1,
  },
  menuContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  menuSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#94A3B8",
    letterSpacing: 1,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 2,
  },
  menuItemActive: {
    backgroundColor: "#EFF6FF",
  },
  menuItemHighlight: {
    backgroundColor: "#FFFBEB",
  },
  menuItemAdmin: {
    backgroundColor: "#FEF2F2",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemIconActive: {
    backgroundColor: "#DBEAFE",
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#334155",
  },
  menuItemLabelActive: {
    color: "#3B82F6",
  },
  menuItemLabelHighlight: {
    color: "#D97706",
  },
  logoutSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#EF4444",
  },
  authSection: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
  },
  signInText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  drawerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#94A3B8",
  },
  versionText: {
    fontSize: 12,
    color: "#CBD5E1",
  },
});
