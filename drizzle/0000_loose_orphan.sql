CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` datetime,
	`refresh_token_expires_at` datetime,
	`scope` text,
	`password` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(64),
	`message` text NOT NULL,
	`status` varchar(24) NOT NULL DEFAULT 'unread',
	`source` varchar(40) NOT NULL DEFAULT 'contact_form',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` int NOT NULL,
	`data` json NOT NULL,
	`is_published` boolean NOT NULL DEFAULT false,
	`effective_from` datetime,
	`note` varchar(255),
	`created_by` varchar(36),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote_id` int NOT NULL,
	`author_id` varchar(36),
	`body` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `quote_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(24) NOT NULL,
	`status` varchar(24) NOT NULL DEFAULT 'new',
	`company` varchar(255) NOT NULL,
	`contact_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(64),
	`website` varchar(255),
	`industry` varchar(120),
	`services` json,
	`order_volume` varchar(64),
	`sku_count` varchar(64),
	`storage` varchar(64),
	`channels` json,
	`current_setup` varchar(120),
	`timeline` varchar(120),
	`message` text,
	`estimate` json,
	`source` varchar(40) NOT NULL DEFAULT 'quote_form',
	`assigned_to` varchar(36),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `quote_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `quote_requests_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` datetime NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`ip_address` varchar(255),
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` varchar(36),
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(120) NOT NULL,
	`value` json,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`role` varchar(32) DEFAULT 'staff',
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pricing_config` ADD CONSTRAINT `pricing_config_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quote_notes` ADD CONSTRAINT `quote_notes_quote_id_quote_requests_id_fk` FOREIGN KEY (`quote_id`) REFERENCES `quote_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quote_notes` ADD CONSTRAINT `quote_notes_author_id_user_id_fk` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD CONSTRAINT `quote_requests_assigned_to_user_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;