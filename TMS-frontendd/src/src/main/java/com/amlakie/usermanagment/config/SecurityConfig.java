package com.amlakie.usermanagment.config;
import com.amlakie.usermanagment.service.OurUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// Import CORS classes
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private OurUserDetailsService ourUserDetailsService;

    @Autowired
    private JWTAuthFilter jwtAuthFilter;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Enable CORS using the corsConfigurationSource bean
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 2. Disable CSRF
                .csrf(csrf -> csrf.disable())
                // 3. Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/auth/**", "/public/**").permitAll()

                        // Make all travel request endpoints public (as before)
                        .requestMatchers("/api/travel-requests/**").permitAll()

                        // Car inspection endpoints - Currently public, change if needed
                        // If you want to secure them, change to .authenticated()
                        .requestMatchers("/api/inspections/**").permitAll()
                        .requestMatchers("/api/org-inspections/**").permitAll()
                        .requestMatchers("/api/daily-requests/**").permitAll()

                        // Admin endpoints
                        .requestMatchers("/admin/**").hasAnyAuthority("ADMIN")

                        // User endpoints
                        .requestMatchers("/user/**").hasAnyAuthority("USER")

                        // Admin or User endpoints
                        .requestMatchers("/adminuser/**").hasAnyAuthority("ADMIN", "USER")

                        // Secure all other requests
                        .anyRequest().authenticated()
                )
                // 4. Set session management to stateless
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        // 5. Add your JWT filter(s)
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        // Optional: Add CarJwtAuthFilter if needed, decide on the order
        // http.addFilterBefore(carJwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 6. Define the CORS configuration source bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow requests from your frontend origin
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Allow specific headers, including Authorization for JWT and Content-Type
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        // Optional: Allow credentials if needed (e.g., for cookies)
        // configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // This way of defining AuthenticationManager is common for older Spring Security versions.
    // For newer versions (Spring Boot 3+), you might not need to explicitly define it
    // if you configure the AuthenticationManagerBuilder elsewhere or rely on the default provider manager.
    // However, this should still work.
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
                .userDetailsService(ourUserDetailsService)
                .passwordEncoder(passwordEncoder());
        return authenticationManagerBuilder.build();
    }
}