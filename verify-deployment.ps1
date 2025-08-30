# Smart Ship App - Post-Deployment Verification Script
# Run this after successful deployment to verify all features

param(
    [Parameter(Mandatory=$true)]
    [string]$DeploymentUrl
)

Write-Host "🔍 Smart Ship App - Post-Deployment Verification" -ForegroundColor Green
Write-Host "Testing deployment at: $DeploymentUrl" -ForegroundColor Cyan
Write-Host "=" * 60

# Function to test URL and measure response time
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30
        $stopwatch.Stop()
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ $Description" -ForegroundColor Green
            Write-Host "   Response time: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
            return $true
        } else {
            Write-Host "❌ $Description (Status: $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ $Description (Error: $($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

# Function to test security headers
function Test-SecurityHeaders {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing
        $headers = $response.Headers
        
        $securityChecks = @{
            "X-Frame-Options" = "DENY"
            "X-Content-Type-Options" = "nosniff"
            "Referrer-Policy" = "origin-when-cross-origin"
        }
        
        Write-Host "`n🔒 Security Headers Check:" -ForegroundColor Cyan
        
        foreach ($header in $securityChecks.GetEnumerator()) {
            if ($headers.ContainsKey($header.Key)) {
                $value = $headers[$header.Key] -join ","
                if ($value -eq $header.Value) {
                    Write-Host "✅ $($header.Key): $value" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  $($header.Key): $value (Expected: $($header.Value))" -ForegroundColor Yellow
                }
            } else {
                Write-Host "❌ $($header.Key): Missing" -ForegroundColor Red
            }
        }
        
        # Check for HTTPS
        if ($Url.StartsWith("https://")) {
            Write-Host "✅ HTTPS: Enabled" -ForegroundColor Green
        } else {
            Write-Host "❌ HTTPS: Not enabled" -ForegroundColor Red
        }
        
    }
    catch {
        Write-Host "❌ Security headers check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Core functionality tests
Write-Host "`n🌐 Core Functionality Tests:" -ForegroundColor Cyan

$tests = @(
    @{ Url = "$DeploymentUrl/"; Description = "Homepage" },
    @{ Url = "$DeploymentUrl/auth/login"; Description = "Login page" },
    @{ Url = "$DeploymentUrl/auth/signup"; Description = "Signup page" },
    @{ Url = "$DeploymentUrl/dashboard"; Description = "Dashboard page" },
    @{ Url = "$DeploymentUrl/manifest.json"; Description = "PWA Manifest" },
    @{ Url = "$DeploymentUrl/sw.js"; Description = "Service Worker" },
    @{ Url = "$DeploymentUrl/monitoring"; Description = "Monitoring page" }
)

$passedTests = 0
$totalTests = $tests.Count

foreach ($test in $tests) {
    if (Test-Endpoint -Url $test.Url -Description $test.Description) {
        $passedTests++
    }
    Start-Sleep -Milliseconds 500  # Rate limiting
}

# Test security headers
Test-SecurityHeaders -Url $DeploymentUrl

# PWA specific tests
Write-Host "`n📱 PWA Tests:" -ForegroundColor Cyan

# Test manifest.json content
try {
    $manifestResponse = Invoke-WebRequest -Uri "$DeploymentUrl/manifest.json" -UseBasicParsing
    $manifest = $manifestResponse.Content | ConvertFrom-Json
    
    if ($manifest.name -and $manifest.start_url -and $manifest.icons) {
        Write-Host "✅ PWA Manifest: Valid structure" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PWA Manifest: Missing required fields" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ PWA Manifest: Error reading manifest" -ForegroundColor Red
}

# Test service worker
try {
    $swResponse = Invoke-WebRequest -Uri "$DeploymentUrl/sw.js" -UseBasicParsing
    if ($swResponse.Content.Contains("addEventListener")) {
        Write-Host "✅ Service Worker: Contains event listeners" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Service Worker: May not be properly configured" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Service Worker: Error reading service worker" -ForegroundColor Red
}

# Performance recommendations
Write-Host "`n⚡ Performance Recommendations:" -ForegroundColor Cyan
Write-Host "1. Test with Google PageSpeed Insights: https://pagespeed.web.dev/analysis?url=$DeploymentUrl"
Write-Host "2. Test with GTmetrix: https://gtmetrix.com/"
Write-Host "3. Test mobile performance with Chrome DevTools"
Write-Host "4. Monitor Core Web Vitals in Vercel Analytics"

# Monitoring and analytics
Write-Host "`n📊 Monitoring Setup:" -ForegroundColor Cyan
Write-Host "1. Check Vercel Analytics dashboard"
Write-Host "2. Set up error tracking (Sentry)"
Write-Host "3. Configure Google Analytics (optional)"
Write-Host "4. Set up uptime monitoring (optional)"

# Summary
Write-Host "`n📋 Test Summary:" -ForegroundColor Cyan
Write-Host "Passed: $passedTests/$totalTests tests" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
    Write-Host "`n🎉 All tests passed! Your Smart Ship App is successfully deployed!" -ForegroundColor Green
    Write-Host "🌐 Live URL: $DeploymentUrl" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Some tests failed. Please review the results above." -ForegroundColor Yellow
}

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test user registration and login"
Write-Host "2. Create a test booking"
Write-Host "3. Test PWA installation on mobile"
Write-Host "4. Monitor performance and errors"
Write-Host "5. Set up custom domain (optional)"

Write-Host "`nDeployment verification completed!" -ForegroundColor Green
