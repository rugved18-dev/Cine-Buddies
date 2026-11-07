package com.cinebuddies;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class CinebuddiesBackendApplication {

	public static void main(String[] args) {
		loadDotenv();
		SpringApplication.run(CinebuddiesBackendApplication.class, args);
	}

	private static void loadDotenv() {
		String[] locations = { ".env", "backend/.env", "Backend/.env", "../.env" };
		for (String path : locations) {
			File file = new File(path);
			if (file.exists() && file.isFile()) {
				try {
					List<String> lines = Files.readAllLines(file.toPath());
					for (String line : lines) {
						String trimmed = line.trim();
						if (trimmed.isEmpty() || trimmed.startsWith("#")) {
							continue;
						}
						int equalIndex = trimmed.indexOf('=');
						if (equalIndex > 0) {
							String key = trimmed.substring(0, equalIndex).trim();
							String value = trimmed.substring(equalIndex + 1).trim();
							// Strip surrounding quotes if present
							if ((value.startsWith("\"") && value.endsWith("\"")) ||
							    (value.startsWith("'") && value.endsWith("'"))) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
					System.out.println("[CineBuddies] Loaded .env configuration from: " + file.getAbsolutePath());
					return;
				} catch (Exception e) {
					System.err.println("[CineBuddies] Could not parse .env from " + path + ": " + e.getMessage());
				}
			}
		}
	}

}
