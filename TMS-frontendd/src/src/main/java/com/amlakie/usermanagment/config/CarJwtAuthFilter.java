package com.amlakie.usermanagment.config;

import com.amlakie.usermanagment.service.CarJwtUtils;
// Assuming you might need a UserDetailsService for cars/roles if applicable
// import com.amlakie.usermanagment.service.CarUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull; // Use @NonNull
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Import UserDetails
// Import a specific UserDetailsService if needed for cars/roles
// import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils; // Import StringUtils
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections; // For empty authorities if no UserDetails loaded

// Decide if @Component is correct or if it should only be added via SecurityConfig
@Component
public class CarJwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(CarJwtAuthFilter.class);

    @Autowired
    private CarJwtUtils carJwtUtils;

    // Optional: Autowire a specific UserDetailsService if needed for roles/authorities
    // @Autowired
    // private UserDetailsService carUserDetailsService; // Example

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;
        final String identifier; // e.g., userEmail, carPlate, etc.

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.trace("[CarJwtAuthFilter] No JWT token found or header invalid.");
            filterChain.doFilter(request, response);
            return;
        }

        jwtToken = authHeader.substring(7);

        // *** ADD THIS CHECK ***
        if (!StringUtils.hasText(jwtToken)) {
            log.warn("[CarJwtAuthFilter] Authorization header had 'Bearer ' prefix but the token itself was empty.");
            filterChain.doFilter(request, response);
            return;
        }
        // *********************

        try {
            // Extract the relevant identifier (e.g., username, subject)
            identifier = carJwtUtils.extractUsername(jwtToken); // Assuming it extracts username/email

            // Check if identifier is extracted and no authentication is currently set
            if (identifier != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.debug("[CarJwtAuthFilter] Attempting to validate token for identifier: {}", identifier);

                // --- Option 1: If you don't need UserDetails/Roles for this filter ---
                // Validate token structure/expiration/signature only
                if (carJwtUtils.isTokenValid(jwtToken)) { // Assuming isTokenValid checks signature/expiration
                    log.debug("[CarJwtAuthFilter] Token deemed valid for identifier: {}", identifier);
                    // Create token with the identifier as principal and NO authorities
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            identifier, // Principal can be the identifier string
                            null,
                            Collections.emptyList() // No authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("[CarJwtAuthFilter] Authentication context set for identifier '{}' (no authorities).", identifier);
                } else {
                    log.warn("[CarJwtAuthFilter] Token validation failed for identifier: {}", identifier);
                }

                // --- Option 2: If you DO need UserDetails/Roles ---
                /*
                UserDetails userDetails = carUserDetailsService.loadUserByUsername(identifier); // Load user details
                if (carJwtUtils.isTokenValid(jwtToken, userDetails)) { // Assuming isTokenValid takes UserDetails
                    log.debug("[CarJwtAuthFilter] Token is valid for user: {}", identifier);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities() // Use authorities from UserDetails
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("[CarJwtAuthFilter] User '{}' successfully authenticated via Car JWT.", identifier);
                } else {
                    log.warn("[CarJwtAuthFilter] Token validation failed for user: {}", identifier);
                }
                */
                // --- Choose Option 1 or Option 2 ---

            }
        } catch (ExpiredJwtException e) {
            log.warn("[CarJwtAuthFilter] JWT token has expired: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("[CarJwtAuthFilter] Invalid JWT token format received: {}", e.getMessage());
        } catch (SignatureException e) {
            log.error("[CarJwtAuthFilter] Invalid JWT signature: {}", e.getMessage());
        } catch (JwtException e) { // Catch other potential JWT library errors
            log.error("[CarJwtAuthFilter] Error processing JWT token: {}", e.getMessage());
        } catch (Exception e) { // Catch unexpected errors (e.g., UserDetailsService issues)
            log.error("[CarJwtAuthFilter] An error occurred during filter processing: {}", e.getMessage(), e);
        }
// In your CarJwtAuthFilter or TravelRequestJWTAuthFilter
        log.debug("Received Authorization header: {}", request.getHeader("Authorization"));
        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}