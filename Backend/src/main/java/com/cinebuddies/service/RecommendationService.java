package com.cinebuddies.service;

import com.cinebuddies.dto.analysis.GroupAnalysisResponse;
import com.cinebuddies.dto.recommendation.RecommendationResponse;
import com.cinebuddies.dto.recommendation.TMDBMovie;
import com.cinebuddies.dto.recommendation.TMDBMovieResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private static final Map<String, Integer> TMDB_GENRE_MAP = Map.ofEntries(
            Map.entry("action", 28),
            Map.entry("adventure", 12),
            Map.entry("animation", 16),
            Map.entry("comedy", 35),
            Map.entry("crime", 80),
            Map.entry("documentary", 99),
            Map.entry("drama", 18),
            Map.entry("family", 10751),
            Map.entry("fantasy", 14),
            Map.entry("history", 36),
            Map.entry("horror", 27),
            Map.entry("music", 10402),
            Map.entry("mystery", 9648),
            Map.entry("romance", 10749),
            Map.entry("science fiction", 878),
            Map.entry("sci-fi", 878),
            Map.entry("tv movie", 10770),
            Map.entry("thriller", 53),
            Map.entry("war", 10752),
            Map.entry("western", 37)
    );

    private static final Map<String, String> LANGUAGE_CODE_MAP = Map.ofEntries(
            Map.entry("english", "en"),
            Map.entry("spanish", "es"),
            Map.entry("french", "fr"),
            Map.entry("hindi", "hi"),
            Map.entry("japanese", "ja"),
            Map.entry("korean", "ko"),
            Map.entry("german", "de"),
            Map.entry("italian", "it")
    );

    private final AnalysisService analysisService;
    private final RestTemplate restTemplate;

    @Value("${cinebuddies.tmdb.api-key}")
    private String apiKey;

    @Value("${cinebuddies.tmdb.base-url}")
    private String baseUrl;

    public RecommendationService(AnalysisService analysisService, RestTemplate restTemplate) {
        this.analysisService = analysisService;
        this.restTemplate = restTemplate;
    }

    public List<RecommendationResponse> getRecommendations(String roomCode) {
        GroupAnalysisResponse analysis = analysisService.analyzeRoom(roomCode);

        List<Integer> matchedGenreIds = Collections.emptyList();
        if (analysis.commonGenres() != null && !analysis.commonGenres().isEmpty()) {
            matchedGenreIds = analysis.commonGenres().stream()
                    .map(g -> TMDB_GENRE_MAP.get(g.trim().toLowerCase()))
                    .filter(Objects::nonNull)
                    .toList();
        }

        List<Integer> excludedGenreIds = Collections.emptyList();
        if (analysis.genreConflicts() != null && !analysis.genreConflicts().isEmpty()) {
            excludedGenreIds = analysis.genreConflicts().stream()
                    .map(g -> TMDB_GENRE_MAP.get(g.trim().toLowerCase()))
                    .filter(Objects::nonNull)
                    .toList();
        }

        // Build TMDB Discover URL
        StringBuilder urlBuilder = new StringBuilder();
        urlBuilder.append(baseUrl).append("/discover/movie");
        urlBuilder.append("?api_key=").append(apiKey);
        urlBuilder.append("&sort_by=popularity.desc");
        urlBuilder.append("&include_adult=false");

        if (analysis.averageMinRating() != null && analysis.averageMinRating().doubleValue() > 0) {
            urlBuilder.append("&vote_average.gte=").append(analysis.averageMinRating());
        }

        if (!matchedGenreIds.isEmpty()) {
            String withGenres = matchedGenreIds.stream().map(String::valueOf).collect(Collectors.joining(","));
            urlBuilder.append("&with_genres=").append(withGenres);
        }

        if (!excludedGenreIds.isEmpty()) {
            String withoutGenres = excludedGenreIds.stream().map(String::valueOf).collect(Collectors.joining(","));
            urlBuilder.append("&without_genres=").append(withoutGenres);
        }

        if (analysis.commonLanguages() != null && !analysis.commonLanguages().isEmpty()) {
            String firstLang = analysis.commonLanguages().get(0).trim().toLowerCase();
            String langCode = LANGUAGE_CODE_MAP.getOrDefault(firstLang, "en");
            urlBuilder.append("&with_original_language=").append(langCode);
        }

        String tmdbUrl = urlBuilder.toString();
        log.info("[CineBuddies] Calling TMDB endpoint for room {}: {}", roomCode, tmdbUrl.replaceAll("api_key=[^&]+", "api_key=***"));

        try {
            TMDBMovieResponse response = restTemplate.getForObject(tmdbUrl, TMDBMovieResponse.class);

            if (response != null && response.results() != null && !response.results().isEmpty()) {
                final List<Integer> finalMatchedGenreIds = matchedGenreIds;
                return response.results().stream()
                        .limit(5)
                        .map(movie -> mapToRecommendation(movie, finalMatchedGenreIds, analysis))
                        .toList();
            }
        } catch (Exception e) {
            log.warn("[CineBuddies] TMDB API call failed or unconfigured ({}). Returning fallback curated titles.", e.getMessage());
        }

        // Curated fallback in case TMDB key is not yet set or returns empty
        return getFallbackRecommendations(analysis);
    }

    private RecommendationResponse mapToRecommendation(
            TMDBMovie movie,
            List<Integer> matchedGenreIds,
            GroupAnalysisResponse analysis
    ) {
        int year = 2024;
        if (movie.release_date() != null && movie.release_date().length() >= 4) {
            try {
                year = Integer.parseInt(movie.release_date().substring(0, 4));
            } catch (NumberFormatException ignored) {}
        }

        String poster = movie.poster_path();
        if (poster != null && !poster.isEmpty() && !poster.startsWith("http")) {
            poster = "https://image.tmdb.org/t/p/w500" + poster;
        }

        // Calculate dynamic match percentage
        double matchScore = 82.0;
        if (movie.genre_ids() != null && !matchedGenreIds.isEmpty()) {
            boolean hasCommon = movie.genre_ids().stream().anyMatch(matchedGenreIds::contains);
            if (hasCommon) {
                matchScore = 95.0;
            }
        } else if (movie.vote_average() >= 7.5) {
            matchScore = 91.0;
        }

        String lang = (analysis.commonLanguages() != null && !analysis.commonLanguages().isEmpty())
                ? analysis.commonLanguages().get(0)
                : "English";

        return new RecommendationResponse(
                movie.id(),
                movie.title() != null ? movie.title() : "Untitled",
                movie.overview() != null ? movie.overview() : "No overview available.",
                poster,
                year,
                movie.vote_average(),
                lang,
                matchScore
        );
    }

    private List<RecommendationResponse> getFallbackRecommendations(GroupAnalysisResponse analysis) {
        return List.of(
                new RecommendationResponse(
                        "157336",
                        "Interstellar",
                        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                        "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                        2014,
                        8.7,
                        "English",
                        96.0
                ),
                new RecommendationResponse(
                        "693134",
                        "Dune: Part Two",
                        "Paul Atreides unites with the Fremen people while seeking revenge against the conspirators who destroyed his family.",
                        "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                        2024,
                        8.5,
                        "English",
                        92.0
                ),
                new RecommendationResponse(
                        "27205",
                        "Inception",
                        "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.",
                        "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
                        2010,
                        8.4,
                        "English",
                        88.0
                ),
                new RecommendationResponse(
                        "496243",
                        "Parasite",
                        "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
                        "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
                        2019,
                        8.5,
                        "Korean",
                        85.0
                ),
                new RecommendationResponse(
                        "155",
                        "The Dark Knight",
                        "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
                        "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                        2008,
                        9.0,
                        "English",
                        82.0
                )
        );
    }
}

