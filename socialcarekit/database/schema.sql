-- ============================================================
-- SocialCareKit — MySQL schema
-- Import via phpMyAdmin (or: mysql -u user -p dbname < schema.sql)
-- Requires MySQL 5.7+ / MariaDB 10.3+ (utf8mb4, FULLTEXT on InnoDB)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Admin users & security
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(190) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  totp_secret   VARCHAR(64)  DEFAULT NULL,          -- NULL = 2FA off
  reset_token   VARCHAR(64)  DEFAULT NULL,
  reset_expires DATETIME     DEFAULT NULL,
  last_login_at DATETIME     DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email        VARCHAR(190) NOT NULL,
  ip           VARCHAR(45)  NOT NULL,
  success      TINYINT(1)   NOT NULL DEFAULT 0,
  attempted_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_attempts (email, ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED DEFAULT NULL,
  user_email VARCHAR(190) DEFAULT NULL,
  action     VARCHAR(80)  NOT NULL,        -- e.g. article.update
  entity     VARCHAR(80)  DEFAULT NULL,
  entity_id  VARCHAR(80)  DEFAULT NULL,
  detail     TEXT,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Content: guides & rights articles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articles (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(190) NOT NULL,
  section          ENUM('guides','rights') NOT NULL,
  title            VARCHAR(255) NOT NULL,
  meta_description VARCHAR(320) DEFAULT NULL,
  summary          TEXT,
  key_legislation  TEXT,                     -- JSON array of strings
  body_html        MEDIUMTEXT NOT NULL,
  status           ENUM('draft','published') NOT NULL DEFAULT 'draft',
  review_due       DATE DEFAULT NULL,
  published_at     DATETIME DEFAULT NULL,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_article_slug (section, slug),
  KEY idx_article_status (status, section),
  FULLTEXT KEY ft_articles (title, summary, body_html)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Template library
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS templates (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(190) NOT NULL,
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  supports         VARCHAR(500) DEFAULT NULL,  -- regulation/standard supported
  regulator        ENUM('ofsted','cqc','both') NOT NULL DEFAULT 'both',
  category         VARCHAR(60) NOT NULL DEFAULT 'recording',
  format           ENUM('docx','pdf','xlsx') NOT NULL DEFAULT 'docx',
  filename         VARCHAR(255) NOT NULL,      -- stored name under storage/templates/files
  filesize         INT UNSIGNED NOT NULL DEFAULT 0,
  download_count   INT UNSIGNED NOT NULL DEFAULT 0,
  status           ENUM('draft','published') NOT NULL DEFAULT 'published',
  last_reviewed    DATE DEFAULT NULL,
  review_due       DATE DEFAULT NULL,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_template_slug (slug),
  FULLTEXT KEY ft_templates (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS download_stats (
  template_id INT UNSIGNED NOT NULL,
  day         DATE NOT NULL,
  downloads   INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (template_id, day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Acronym glossary
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acronyms (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  acronym    VARCHAR(40)  NOT NULL,
  full_term  VARCHAR(255) NOT NULL,
  meaning    TEXT NOT NULL,
  sector     ENUM('children','adults','both','health','education','legal') NOT NULL DEFAULT 'both',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_acronym_term (acronym, full_term),
  FULLTEXT KEY ft_acronyms (acronym, full_term, meaning)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Rates & configurable rules (NMW bands, WTR params, notification text)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nmw_rates (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  band           VARCHAR(40) NOT NULL,   -- nlw_21_over | age_18_20 | age_16_17 | apprentice
  label          VARCHAR(120) NOT NULL,
  hourly_rate    DECIMAL(6,2) NOT NULL,
  effective_from DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rate (band, effective_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Free-form settings store (JSON values). Keys used:
--   wtr_params, notification_rules_ofsted, notification_rules_cqc,
--   hero_copy, featured_tools, site_banner, maintenance_mode,
--   robots_txt, holiday_params
CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(80) NOT NULL,
  setting_value MEDIUMTEXT,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- SEO
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seo_pages (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  path             VARCHAR(255) NOT NULL,   -- e.g. /tools/body-map/
  title            VARCHAR(255) DEFAULT NULL,
  meta_description VARCHAR(320) DEFAULT NULL,
  canonical        VARCHAR(255) DEFAULT NULL,
  og_title         VARCHAR(255) DEFAULT NULL,
  og_description   VARCHAR(320) DEFAULT NULL,
  og_image         VARCHAR(255) DEFAULT NULL,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_seo_path (path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS redirects (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  from_path  VARCHAR(255) NOT NULL,
  to_path    VARCHAR(255) NOT NULL,
  http_code  SMALLINT UNSIGNED NOT NULL DEFAULT 301,
  hits       INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_redirect_from (from_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Analytics (privacy-respecting: aggregate counts only, no user data)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_views (
  path  VARCHAR(255) NOT NULL,
  day   DATE NOT NULL,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (path, day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS search_queries (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  query         VARCHAR(190) NOT NULL,
  results_count INT UNSIGNED NOT NULL DEFAULT 0,
  searches      INT UNSIGNED NOT NULL DEFAULT 1,
  last_searched DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_query (query)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Contact & feedback inbox
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  msg_type   ENUM('contact','tool_error','feedback') NOT NULL DEFAULT 'contact',
  name       VARCHAR(120) DEFAULT NULL,
  email      VARCHAR(190) DEFAULT NULL,
  subject    VARCHAR(255) DEFAULT NULL,
  tool_page  VARCHAR(255) DEFAULT NULL,   -- which tool an error report refers to
  message    TEXT NOT NULL,
  status     ENUM('new','read','actioned') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_msg_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Newsletter (double opt-in, PECR/GDPR)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email           VARCHAR(190) NOT NULL,
  list_name       ENUM('general','storybuilder') NOT NULL DEFAULT 'general',
  confirm_token   VARCHAR(64) NOT NULL,
  confirmed_at    DATETIME DEFAULT NULL,
  unsubscribed_at DATETIME DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sub (email, list_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
-- Migration 002: general document manager (sections/categories + uploads)
-- Run once on existing installations (new installs get this via schema.sql).

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS doc_categories (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_doc_cat_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documents (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id    INT UNSIGNED DEFAULT NULL,
  slug           VARCHAR(190) NOT NULL,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  stored_name    VARCHAR(255) NOT NULL,     -- file name under storage/documents/
  original_name  VARCHAR(255) NOT NULL,     -- name offered to the downloader
  ext            VARCHAR(10)  NOT NULL,
  mime           VARCHAR(120) NOT NULL,
  filesize       BIGINT UNSIGNED NOT NULL DEFAULT 0,
  download_count INT UNSIGNED NOT NULL DEFAULT 0,
  status         ENUM('draft','published') NOT NULL DEFAULT 'published',
  uploaded_by    VARCHAR(190) DEFAULT NULL,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_document_slug (slug),
  KEY idx_doc_category (category_id, status),
  CONSTRAINT fk_doc_category FOREIGN KEY (category_id) REFERENCES doc_categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO doc_categories (name, slug, sort_order) VALUES
  ('General', 'general', 0)
ON DUPLICATE KEY UPDATE name = name;
