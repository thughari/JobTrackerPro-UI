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
    this.jobService.refreshData();
  }

  chartStrokeColor = computed(() =>
    this.themeService.isDarkMode() ? '#151A23' : '#ffffff'
  );
  gridColor = computed(() =>
    this.themeService.isDarkMode() ? '#374151' : '#e5e7eb'
  );
  textColor = computed(() =>
    this.themeService.isDarkMode() ? '#6b7280' : '#6b7280'
  );

  statusColors = ['#6366f1', '#a855f7', '#f59e0b', '#ef4444', '#10b981'];
  interviewColors = ['#10b981', '#d1d5db'];

  interviewRate = 20;
  offerRate = 20;
}
