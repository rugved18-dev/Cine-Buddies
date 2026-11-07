package com.cinebuddies.dto.preference;

import com.cinebuddies.model.ReleasePeriod;
import java.math.BigDecimal;
import java.util.List;

public record PreferenceRequest(
    List<String> genres,
    List<String> excludedGenres,
    List<String> languages,
    List<String> watchedTitles,
    BigDecimal minRating,
    ReleasePeriod releasePeriod
) {}

