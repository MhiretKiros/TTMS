package com.amlakie.usermanagment.config; // Or wherever this filter resides

import com.amlakie.usermanagment.security.TravelRequestJWTUtils; // Assuming this is the util class
// Other necessary imports...
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component; // Assuming it's a component
import org.springframework.util.StringUtils; // Import StringUtils
import org.springframework.web.filter.OncePerRequestFilter;
// Potentially imports for SecurityContextHolder, UserDetails, etc. if it sets authentication

import java.io.IOException;

// Decide if @Component is correct or if it should only be added via SecurityConfig
@Component
public class TravelRequestJWTAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TravelRequestJWTAuthFilter.class);

    @Autowired
    private TravelRequestJWTUtils travelRequestJwtUtils; // Assuming injection

    // Potentially Autowired UserDetailsService if needed

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;
        final String identifier; // e.g., username, request ID, etc.

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.trace("[TravelRequestJWTAuthFilter] No JWT token found or header invalid.");
            filterChain.doFilter(request, response);
            return;
        }

        jwtToken = authHeader.substring(7);

        // *** ADD THIS CHECK ***
        if (!StringUtils.hasText(jwtToken)) {
            log.warn("[TravelRequestJWTAuthFilter] Authorization header had 'Bearer ' prefix but the token itself was empty.");
            filterChain.doFilter(request, response);
            return;
        }
        // *********************

        try {
            // Extract the relevant identifier (e.g., username, subject)
            // Line 45 likely calls this or a method that calls this
            identifier = travelRequestJwtUtils.extractUsername(jwtToken);

            // --- Add the rest of the filter's logic here ---
            // e.g., load details, validate token, set SecurityContextHolder
            // if (identifier != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            //    // ... validation and context setting logic ...
            // }
            // --- End of filter logic ---

        } catch (ExpiredJwtException e) {
            log.warn("[TravelRequestJWTAuthFilter] JWT token has expired: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("[TravelRequestJWTAuthFilter] Invalid JWT token format received: {}", e.getMessage());
        } catch (SignatureException e) {
            log.error("[TravelRequestJWTAuthFilter] Invalid JWT signature: {}", e.getMessage());
        } catch (JwtException e) { // Catch other potential JWT library errors
            log.error("[TravelRequestJWTAuthFilter] Error processing JWT token: {}", e.getMessage());
        } catch (Exception e) { // Catch unexpected errors
            log.error("[TravelRequestJWTAuthFilter] An error occurred during filter processing: {}", e.getMessage(), e);
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}