import { Component, computed, inject, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { JobService } from '../../services/job.service';
import { CommonModule } from '@angular/common';
import { DonutChartComponent } from '../donut-chart/donut-chart.component';
import { BarChartComponent } from '../bar-chart/bar-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DonutChartComponent, BarChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private jobService = inject(JobService);
  private themeService = inject(ThemeService);

  stats = this.jobService.dashboardStats;
  statusData = this.jobService.statusDistribution;
  monthlyData = this.jobService.monthlyApplications;
  interviewData = this.jobService.interviewProgress;

  ngOnInit() {
    this.jobService.loadDashboard();
  }

  interviewRate = computed(() => {
    const total = this.stats().totalApplications;
    const interviews = this.stats().interviews;

    if (!total || total === 0) return 0;
    return Math.round((interviews / total) * 100);
  });

  offerRate = computed(() => {
    const interviews = this.stats().interviews;
    const offers = this.stats().offers;

    if (!interviews || interviews === 0) return 0;
    return Math.round((offers / interviews) * 100);
  });

  chartStrokeColor = computed(() =>
    this.themeService.isDarkMode() ? '#151A23' : '#ffffff'
  );
  gridColor = computed(() =>
    this.themeService.isDarkMode() ? '#374151' : '#e5e7eb'
  );
  textColor = computed(() =>
    this.themeService.isDarkMode() ? '#6b7280' : '#6b7280'
  );

  statusColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];
  interviewColors = ['#10b981', '#d1d5db'];
}
