package com.cinebuddies.dto.analysis;

import java.math.BigDecimal;
import java.util.List;

public record GroupAnalysisResponse(
    List<MemberSummary> memberSummaries,
    List<String> commonGenres,
    List<String> commonLanguages,
    BigDecimal averageMinRating,
    List<ContentTypeDistribution> contentTypeDistribution,
    List<String> genreConflicts,
    String insight
) {}

