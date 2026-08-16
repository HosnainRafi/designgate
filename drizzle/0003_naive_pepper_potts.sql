CREATE TABLE `audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`projectId` int,
	`actorUserId` int NOT NULL,
	`action` varchar(120) NOT NULL,
	`resourceType` varchar(80) NOT NULL,
	`resourceId` varchar(80),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','reviewer','member') NOT NULL DEFAULT 'member',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `project_member_unique` UNIQUE(`projectId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`createdByUserId` int NOT NULL,
	`retentionDays` int NOT NULL DEFAULT 30,
	`monthlyRunQuota` int NOT NULL DEFAULT 25,
	`isArchived` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `project_workspace_slug_unique` UNIQUE(`workspaceId`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `quota_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`projectId` int NOT NULL,
	`periodKey` varchar(7) NOT NULL,
	`verificationRuns` int NOT NULL DEFAULT 0,
	`manualCleanups` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quota_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `quota_usage_period_unique` UNIQUE(`projectId`,`periodKey`)
);
--> statement-breakpoint
CREATE TABLE `run_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`projectId` int NOT NULL,
	`runId` int NOT NULL,
	`reviewerUserId` int NOT NULL,
	`status` enum('pending','approved','changes_requested') NOT NULL DEFAULT 'pending',
	`note` text,
	`decidedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `run_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `run_reviewer_unique` UNIQUE(`runId`,`reviewerUserId`)
);
--> statement-breakpoint
CREATE TABLE `verification_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`projectId` int NOT NULL,
	`runId` int,
	`requestedByUserId` int NOT NULL,
	`type` enum('verification','retention_cleanup') NOT NULL DEFAULT 'verification',
	`status` enum('queued','running','completed','failed','canceled') NOT NULL DEFAULT 'queued',
	`requestPayload` text NOT NULL,
	`progressPercent` int NOT NULL DEFAULT 0,
	`error` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','reviewer','member') NOT NULL DEFAULT 'member',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_member_unique` UNIQUE(`workspaceId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`createdByUserId` int NOT NULL,
	`plan` enum('starter') NOT NULL DEFAULT 'starter',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspaces_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `runs` MODIFY COLUMN `status` enum('queued','running','passed','failed','canceled') NOT NULL DEFAULT 'queued';--> statement-breakpoint
ALTER TABLE `rubric_configs` ADD `workspaceId` int;--> statement-breakpoint
ALTER TABLE `rubric_configs` ADD `projectId` int;--> statement-breakpoint
ALTER TABLE `rubric_configs` ADD `createdByUserId` int;--> statement-breakpoint
ALTER TABLE `runs` ADD `workspaceId` int;--> statement-breakpoint
ALTER TABLE `runs` ADD `projectId` int;--> statement-breakpoint
ALTER TABLE `runs` ADD `createdByUserId` int;--> statement-breakpoint
CREATE INDEX `audit_event_project_created_idx` ON `audit_events` (`projectId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `audit_event_workspace_created_idx` ON `audit_events` (`workspaceId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `project_member_user_idx` ON `project_members` (`userId`);--> statement-breakpoint
CREATE INDEX `project_workspace_idx` ON `projects` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `quota_usage_workspace_period_idx` ON `quota_usage` (`workspaceId`,`periodKey`);--> statement-breakpoint
CREATE INDEX `run_review_project_status_idx` ON `run_reviews` (`projectId`,`status`);--> statement-breakpoint
CREATE INDEX `verification_job_project_status_idx` ON `verification_jobs` (`projectId`,`status`);--> statement-breakpoint
CREATE INDEX `verification_job_run_idx` ON `verification_jobs` (`runId`);--> statement-breakpoint
CREATE INDEX `workspace_member_user_idx` ON `workspace_members` (`userId`);--> statement-breakpoint
CREATE INDEX `rubric_project_idx` ON `rubric_configs` (`projectId`);--> statement-breakpoint
CREATE INDEX `run_iteration_run_idx` ON `run_iterations` (`runId`,`iteration`);--> statement-breakpoint
CREATE INDEX `run_project_created_idx` ON `runs` (`projectId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `run_workspace_created_idx` ON `runs` (`workspaceId`,`createdAt`);