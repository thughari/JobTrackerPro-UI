import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  date: string;
  status: string;
  stage: number;
  stageStatus: string;
  salaryMin: number;
  salaryMax: number;
  url?: string;
  notes?: string;
}

export interface DashboardStats {
  totalApplications: number;
  activePipeline: number;
  interviews: number;
  offers: number;
}

interface JobDataResponse {
  jobs: Job[];
  stats: DashboardStats;
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly API = environment.apiBaseUrl;

  private http = inject(HttpClient);
  private apiUrl = `${this.API}/api/jobs`;

  private jobsSignal = signal<Job[]>([]);
  readonly jobs = this.jobsSignal.asReadonly();

  readonly dashboardStats = signal<DashboardStats>({
    totalApplications: 0,
    activePipeline: 0,
    interviews: 0,
    offers: 0,
  });

  showModal = signal(false);
  selectedJob = signal<Job | null>(null);

  constructor() {}

  async refreshData() {
    try {
      const data = await firstValueFrom(
        this.http.get<JobDataResponse>(this.apiUrl)
      );
      this.jobsSignal.set(data.jobs);
      this.dashboardStats.set(data.stats);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }

  clearState() {
    this.jobsSignal.set([]);
    this.dashboardStats.set({
      totalApplications: 0,
      activePipeline: 0,
      interviews: 0,
      offers: 0,
    });
    this.showModal.set(false);
    this.selectedJob.set(null);
  }


  async addJob(job: any) {
    try {
      await firstValueFrom(this.http.post(this.apiUrl, job));
      this.refreshData();
    } catch (err) {
      console.error(err);
    }
  }

  async updateJob(job: Job) {
    try {
      await firstValueFrom(this.http.put(`${this.apiUrl}/${job.id}`, job));
      this.refreshData();
    } catch (err) {
      console.error(err);
    }
  }

  async deleteJob(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.refreshData();
    } catch (err) {
      console.error(err);
    }
  }

  openModal(job: Job | null = null) {
    this.selectedJob.set(job);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedJob.set(null);
  }

  readonly statusDistribution = computed(() => {
    const counts: Record<string, number> = {};
    this.jobsSignal().forEach((job) => {
      counts[job.status] = (counts[job.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  });

  readonly monthlyApplications = computed(() => {
    const counts: Record<string, number> = {};
    const sorted = [...this.jobsSignal()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    sorted.forEach((job) => {
      const key = new Date(job.date).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  });

  readonly interviewProgress = computed(() => {
    const interviewed = this.jobsSignal().filter((j) => j.stage >= 3).length;
    const total = this.jobsSignal().length;
    return [
      { name: 'Interviewed', value: interviewed },
      { name: 'Not Interviewed', value: total > 0 ? total - interviewed : 0 },
    ];
  });
}
