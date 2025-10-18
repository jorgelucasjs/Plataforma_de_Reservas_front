/**
 * Integration Test Runner
 * 
 * This is the main test runner that orchestrates all integration tests,
 * user flow validations, data consistency checks, and error scenario tests.
 */

import { UserFlowValidator, type ValidationResult } from './userFlowValidation';
import { DataConsistencyChecker, type ConsistencyReport } from './dataConsistencyChecker';
import { ErrorScenarioTester, type ErrorTestSuite } from './errorScenarioTester';

interface IntegrationTestReport {
  timestamp: string;
  duration: number;
  userFlowResults: ValidationResult[];
  consistencyReport: ConsistencyReport;
  errorTestResults: ErrorTestSuite[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    criticalIssues: number;
    warnings: number;
  };
  recommendations: string[];
}

class IntegrationTestRunner {
  private userFlowValidator: UserFlowValidator;
  private consistencyChecker: DataConsistencyChecker;
  private errorTester: ErrorScenarioTester;

  constructor() {
    this.userFlowValidator = new UserFlowValidator();
    this.consistencyChecker = new DataConsistencyChecker();
    this.errorTester = new ErrorScenarioTester();
  }

  private generateRecommendations(
    userFlowResults: ValidationResult[],
    consistencyReport: ConsistencyReport,
    errorTestResults: ErrorTestSuite[]
  ): string[] {
    const recommendations: string[] = [];

    // Analyze user flow results
    const failedUserFlows = userFlowResults.filter(r => !r.success);
    if (failedUserFlows.length > 0) {
      recommendations.push(`🔄 Fix ${failedUserFlows.length} failed user flow(s) to improve user experience`);
      
      const slowTests = userFlowResults.filter(r => r.duration > 5000);
      if (slowTests.length > 0) {
        recommendations.push(`⚡ Optimize ${slowTests.length} slow user flow(s) (>5s) for better performance`);
      }
    }

    // Analyze consistency issues
    if (!consistencyReport.isConsistent) {
      const errors = consistencyReport.issues.filter(i => i.type === 'error');
      const warnings = consistencyReport.issues.filter(i => i.type === 'warning');
      
      if (errors.length > 0) {
        recommendations.push(`🚨 Critical: Fix ${errors.length} data consistency error(s) immediately`);
      }
      
      if (warnings.length > 0) {
        recommendations.push(`⚠️  Address ${warnings.length} data consistency warning(s) to prevent future issues`);
      }
    }

    // Analyze error test results
    const totalErrorTests = errorTestResults.reduce((sum, suite) => sum + suite.totalTests, 0);
    const failedErrorTests = errorTestResults.reduce((sum, suite) => sum + suite.failedTests, 0);
    
    if (failedErrorTests > 0) {
      recommendations.push(`🛡️  Improve error handling for ${failedErrorTests}/${totalErrorTests} error scenarios`);
    }

    // Performance recommendations
    const avgUserFlowTime = userFlowResults.reduce((sum, r) => sum + r.duration, 0) / userFlowResults.length;
    if (avgUserFlowTime > 3000) {
      recommendations.push(`🏃 Consider performance optimizations - average user flow time is ${avgUserFlowTime.toFixed(0)}ms`);
    }

    // Security recommendations
    const authFailures = errorTestResults
      .find(suite => suite.suiteName.includes('Authentication'))
      ?.results.filter(r => !r.success) || [];
    
    if (authFailures.length > 2) {
      recommendations.push(`🔐 Review authentication security - multiple auth error tests failed`);
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('✅ All tests passed! Consider adding more edge case tests as the application grows');
    } else {
      recommendations.push('📚 Review failed tests and implement fixes before production deployment');
    }

    return recommendations;
  }

  async runFullIntegrationTest(): Promise<IntegrationTestReport> {
    console.log('🚀 Starting Full Integration Test Suite...\n');
    console.log('This will test user flows, data consistency, and error scenarios.\n');
    
    const startTime = performance.now();

    try {
      // Step 1: Run user flow validations
      console.log('📋 Step 1: Running User Flow Validations...');
      await this.userFlowValidator.runAllValidations();
      const userFlowResults = this.userFlowValidator.getResults();

      // Step 2: Check data consistency
      console.log('\n📊 Step 2: Checking Data Consistency...');
      const consistencyReport = this.consistencyChecker.checkConsistency();
      
      if (!consistencyReport.isConsistent) {
        console.log('⚠️  Data consistency issues detected:');
        this.consistencyChecker.logReport();
      } else {
        console.log('✅ Data consistency check passed');
      }

      // Step 3: Run error scenario tests
      console.log('\n🚨 Step 3: Running Error Scenario Tests...');
      await this.errorTester.runAllErrorTests();
      const errorTestResults = this.errorTester.getResults();

      const duration = performance.now() - startTime;

      // Calculate summary statistics
      const totalUserFlowTests = userFlowResults.length;
      const passedUserFlowTests = userFlowResults.filter(r => r.success).length;
      const failedUserFlowTests = totalUserFlowTests - passedUserFlowTests;

      const totalErrorTests = errorTestResults.reduce((sum, suite) => sum + suite.totalTests, 0);
      const passedErrorTests = errorTestResults.reduce((sum, suite) => sum + suite.passedTests, 0);
      const failedErrorTests = totalErrorTests - passedErrorTests;

      const totalTests = totalUserFlowTests + totalErrorTests + consistencyReport.totalChecks;
      const passedTests = passedUserFlowTests + passedErrorTests + (consistencyReport.isConsistent ? consistencyReport.totalChecks : 0);
      const failedTests = totalTests - passedTests;

      const criticalIssues = consistencyReport.issues.filter(i => i.type === 'error').length + failedUserFlowTests;
      const warnings = consistencyReport.issues.filter(i => i.type === 'warning').length;

      const successRate = (passedTests / totalTests) * 100;

      // Generate recommendations
      const recommendations = this.generateRecommendations(userFlowResults, consistencyReport, errorTestResults);

      const report: IntegrationTestReport = {
        timestamp: new Date().toISOString(),
        duration,
        userFlowResults,
        consistencyReport,
        errorTestResults,
        summary: {
          totalTests,
          passedTests,
          failedTests,
          successRate,
          criticalIssues,
          warnings
        },
        recommendations
      };

      // Print final summary
      this.printFinalSummary(report);

      return report;

    } catch (error) {
      console.error('❌ Integration test suite failed:', error);
      throw error;
    }
  }

  private printFinalSummary(report: IntegrationTestReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 INTEGRATION TEST SUITE SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`📅 Timestamp: ${report.timestamp}`);
    console.log(`⏱️  Duration: ${report.duration.toFixed(2)}ms`);
    console.log();
    
    // Overall statistics
    console.log('📊 Overall Results:');
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   Passed: ${report.summary.passedTests} ✅`);
    console.log(`   Failed: ${report.summary.failedTests} ❌`);
    console.log(`   Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    console.log();
    
    // Issue breakdown
    console.log('🚨 Issue Summary:');
    console.log(`   Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`   Warnings: ${report.summary.warnings}`);
    console.log();
    
    // Detailed breakdown
    console.log('📋 Test Breakdown:');
    console.log(`   User Flow Tests: ${report.userFlowResults.filter(r => r.success).length}/${report.userFlowResults.length} passed`);
    console.log(`   Data Consistency: ${report.consistencyReport.isConsistent ? 'PASSED' : 'FAILED'} (${report.consistencyReport.issues.length} issues)`);
    
    const totalErrorTests = report.errorTestResults.reduce((sum, suite) => sum + suite.totalTests, 0);
    const passedErrorTests = report.errorTestResults.reduce((sum, suite) => sum + suite.passedTests, 0);
    console.log(`   Error Scenarios: ${passedErrorTests}/${totalErrorTests} passed`);
    console.log();
    
    // Recommendations
    console.log('💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    console.log();
    
    // Final verdict
    const isHealthy = report.summary.criticalIssues === 0 && report.summary.successRate >= 90;
    console.log('🏆 Final Verdict:');
    if (isHealthy) {
      console.log('   ✅ APPLICATION IS READY FOR PRODUCTION');
      console.log('   All critical tests passed and success rate is above 90%');
    } else if (report.summary.criticalIssues === 0) {
      console.log('   ⚠️  APPLICATION NEEDS MINOR IMPROVEMENTS');
      console.log('   No critical issues but some tests failed');
    } else {
      console.log('   ❌ APPLICATION NEEDS CRITICAL FIXES');
      console.log('   Critical issues detected - do not deploy to production');
    }
    
    console.log('='.repeat(80));
  }

  // Utility methods for specific test types
  async runUserFlowsOnly(): Promise<ValidationResult[]> {
    console.log('🔄 Running User Flow Tests Only...\n');
    await this.userFlowValidator.runAllValidations();
    return this.userFlowValidator.getResults();
  }

  checkConsistencyOnly(): ConsistencyReport {
    console.log('📊 Running Data Consistency Check Only...\n');
    const report = this.consistencyChecker.checkConsistency();
    this.consistencyChecker.logReport();
    return report;
  }

  async runErrorTestsOnly(): Promise<ErrorTestSuite[]> {
    console.log('🚨 Running Error Scenario Tests Only...\n');
    await this.errorTester.runAllErrorTests();
    return this.errorTester.getResults();
  }

  // Export report to JSON for CI/CD integration
  exportReport(report: IntegrationTestReport): string {
    return JSON.stringify(report, null, 2);
  }

  // Check if application is ready for production
  isProductionReady(report: IntegrationTestReport): boolean {
    return report.summary.criticalIssues === 0 && 
           report.summary.successRate >= 90 && 
           report.consistencyReport.isConsistent;
  }
}

// Utility function to run quick health check
export async function runQuickHealthCheck(): Promise<boolean> {
  console.log('🏥 Running Quick Health Check...\n');
  
  const runner = new IntegrationTestRunner();
  
  try {
    // Run minimal tests
    const consistencyReport = runner.checkConsistencyOnly();
    
    // Quick user flow test (just auth)
    const userFlowValidator = new UserFlowValidator();
    const clientResults = await userFlowValidator.validateClientJourney();
    
    const isHealthy = consistencyReport.isConsistent && 
                     clientResults.filter(r => r.success).length >= clientResults.length * 0.8;
    
    console.log(`\n🏥 Health Check Result: ${isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    
    return isHealthy;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

export { IntegrationTestRunner };
export type { IntegrationTestReport };

// Auto-setup in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  const runner = new IntegrationTestRunner();
  
  // Add to global scope for manual testing
  (window as any).runFullIntegrationTest = () => runner.runFullIntegrationTest();
  (window as any).runQuickHealthCheck = runQuickHealthCheck;
  (window as any).runUserFlowsOnly = () => runner.runUserFlowsOnly();
  (window as any).checkConsistencyOnly = () => runner.checkConsistencyOnly();
  (window as any).runErrorTestsOnly = () => runner.runErrorTestsOnly();
  
  console.log('🔧 Integration Test Runner loaded.');
  console.log('Available commands:');
  console.log('  - runFullIntegrationTest() - Complete test suite');
  console.log('  - runQuickHealthCheck() - Quick health check');
  console.log('  - runUserFlowsOnly() - User flow tests only');
  console.log('  - checkConsistencyOnly() - Data consistency only');
  console.log('  - runErrorTestsOnly() - Error scenarios only');
}