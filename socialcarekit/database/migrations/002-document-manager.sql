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
