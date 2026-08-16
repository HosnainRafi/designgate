CREATE TABLE `rubric_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL DEFAULT 'Default rubric',
	`configFileName` varchar(64) NOT NULL DEFAULT 'designgate.config.json',
	`config` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rubric_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `run_iterations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` int NOT NULL,
	`iteration` int NOT NULL,
	`overallScore` int NOT NULL DEFAULT 0,
	`passed` int NOT NULL DEFAULT 0,
	`tierA` text NOT NULL,
	`tierB` text NOT NULL,
	`critique` text,
	`screenshots` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `run_iterations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`target` text NOT NULL,
	`generatorCommand` text,
	`maxIterations` int NOT NULL DEFAULT 5,
	`threshold` int NOT NULL DEFAULT 350,
	`status` enum('queued','running','passed','failed') NOT NULL DEFAULT 'queued',
	`overallScore` int NOT NULL DEFAULT 0,
	`currentIteration` int NOT NULL DEFAULT 0,
	`rubricConfigId` int,
	`latestCritique` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `runs_id` PRIMARY KEY(`id`)
);
