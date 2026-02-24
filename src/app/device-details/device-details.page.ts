import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { CloudDevicesService } from '../services/cloud-devices.service';
import { SettingsService } from '../services/settings.service';
import { UnifiedDevice } from '../models/device';

Chart.register(...registerables);

type DataSource = 'cloud' | 'local';

interface DataPoint {
  time: Date;
  temp: number | null;
  humidity: number | null;
}

interface CloudApiResponse {
  temp?: { time: number; value: number };
  humidity?: { time: number; value: number };
}

interface LocalApiResponse {
  temp?: number;
  humidity?: number;
  temperature?: number;
}

@Component({
  selector: 'app-device-details',
  templateUrl: 'device-details.page.html',
  styleUrls: ['device-details.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
})
export class DeviceDetailsPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tempChart') tempChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('humidityChart') humidityChartRef!: ElementRef<HTMLCanvasElement>;

  device: UnifiedDevice | null = null;
  deviceId: string = '';
  dataSource: DataSource = 'cloud';
  currentTemp: number | null = null;
  currentHumidity: number | null = null;
  lastUpdate: Date | null = null;
  fetchError: string | null = null;
  isFetching = false;

  private tempChart: Chart | null = null;
  private humidityChart: Chart | null = null;
  private dataPoints: DataPoint[] = [];
  private maxDataPoints = 60;
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private lastValidTemp: number | null = null;
  private lastValidHumidity: number | null = null;

  private readonly CLOUD_API_BASE = 'https://scare.iocare.in/input/get';

  private route = inject(ActivatedRoute);
  private cloud = inject(CloudDevicesService);
  private settings = inject(SettingsService);

  ngOnInit() {
    this.deviceId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadDevice();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initCharts();
      this.startDataUpdates();
    }, 100);
  }

  ngOnDestroy() {
    this.stopDataUpdates();
    this.tempChart?.destroy();
    this.humidityChart?.destroy();
  }

  private loadDevice() {
    const devices = this.cloud.getDevicesSnapshot();
    this.device = devices.find(d => d.id === this.deviceId) ?? null;
  }

  onDataSourceChange(event: CustomEvent) {
    this.dataSource = event.detail.value as DataSource;
    this.dataPoints = [];
    this.lastValidTemp = null;
    this.lastValidHumidity = null;
    this.fetchError = null;
    this.updateCharts();
    this.fetchData();
  }

  private async fetchFromCloud(): Promise<{ temp: number | null; humidity: number | null }> {
    const apiKey = this.settings.apiKey;
    if (!apiKey) {
      throw new Error('API key not configured. Please set it in Settings.');
    }
    const url = `${this.CLOUD_API_BASE}/${this.deviceId}?apikey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Cloud API error: ${response.status}`);
    }
    const data: CloudApiResponse = await response.json();
    return {
      temp: data.temp?.value ?? null,
      humidity: data.humidity?.value ?? null,
    };
  }

  private async fetchFromLocal(): Promise<{ temp: number | null; humidity: number | null }> {
    if (!this.device?.localAddress) {
      throw new Error('No local address available');
    }
    const host = this.device.localAddress.split(':')[0];
    const url = `http://${host}/api/v1/data`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Local API error: ${response.status}`);
    }
    const data: LocalApiResponse = await response.json();
    return {
      temp: data.temp ?? data.temperature ?? null,
      humidity: data.humidity ?? null,
    };
  }

  private async fetchData() {
    this.isFetching = true;
    this.fetchError = null;

    try {
      let result: { temp: number | null; humidity: number | null };

      if (this.dataSource === 'cloud') {
        result = await this.fetchFromCloud();
      } else {
        result = await this.fetchFromLocal();
      }

      if (result.temp !== null) {
        this.lastValidTemp = result.temp;
      }
      if (result.humidity !== null) {
        this.lastValidHumidity = result.humidity;
      }

      this.currentTemp = this.lastValidTemp;
      this.currentHumidity = this.lastValidHumidity;
      this.lastUpdate = new Date();

      this.addDataPoint(this.lastValidTemp, this.lastValidHumidity);
    } catch (err: any) {
      this.fetchError = err?.message ?? 'Failed to fetch data';
      this.addDataPoint(this.lastValidTemp, this.lastValidHumidity);
    } finally {
      this.isFetching = false;
    }
  }

  private initCharts() {
    if (!this.tempChartRef?.nativeElement || !this.humidityChartRef?.nativeElement) {
      return;
    }

    const thresholds = this.settings.thresholds;
    const labels: string[] = [];

    const tempConfig: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: [],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
          },
          {
            label: 'Upper Threshold',
            data: [],
            borderColor: '#f97316',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          {
            label: 'Lower Threshold',
            data: [],
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
          x: {
            display: true,
            title: { display: false },
            ticks: { maxTicksLimit: 6, color: '#666' },
            grid: { color: 'rgba(230, 214, 214, 0.05)' },
          },
          y: {
            display: true,
            title: { display: true, text: '°C', color: '#666' },
            ticks: { color: '#666' },
            grid: { color: 'rgba(0,0,0,0.05)' },
            suggestedMin: thresholds.tempLower - 5,
            suggestedMax: thresholds.tempUpper + 5,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { boxWidth: 12, padding: 8, font: { size: 11 } },
          },
        },
      },
    };

    const humidityConfig: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Humidity (%)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
          },
          {
            label: 'Upper Threshold',
            data: [],
            borderColor: '#f97316',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          {
            label: 'Lower Threshold',
            data: [],
            borderColor: '#22c55e',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
          x: {
            display: true,
            title: { display: false },
            ticks: { maxTicksLimit: 6, color: '#666' },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
          y: {
            display: true,
            title: { display: true, text: '%', color: '#666' },
            ticks: { color: '#666' },
            grid: { color: 'rgba(0,0,0,0.05)' },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { boxWidth: 12, padding: 8, font: { size: 11 } },
          },
        },
      },
    };

    this.tempChart = new Chart(this.tempChartRef.nativeElement, tempConfig);
    this.humidityChart = new Chart(this.humidityChartRef.nativeElement, humidityConfig);
  }

  private startDataUpdates() {
    this.fetchData();
    const intervalMs = this.settings.updateInterval * 1000;
    this.updateInterval = setInterval(() => {
      this.fetchData();
    }, intervalMs);
  }

  private stopDataUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private addDataPoint(temp: number | null, humidity: number | null) {
    if (temp === null && humidity === null && this.dataPoints.length === 0) {
      return;
    }

    const now = new Date();
    const point: DataPoint = {
      time: now,
      temp,
      humidity,
    };

    this.dataPoints.push(point);
    if (this.dataPoints.length > this.maxDataPoints) {
      this.dataPoints.shift();
    }

    this.updateCharts();
  }

  private updateCharts() {
    if (!this.tempChart || !this.humidityChart) return;

    const thresholds = this.settings.thresholds;
    const labels = this.dataPoints.map(p =>
      p.time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    const tempData = this.dataPoints.map(p => p.temp);
    const humidityData = this.dataPoints.map(p => p.humidity);
    const count = this.dataPoints.length;

    this.tempChart.data.labels = labels;
    this.tempChart.data.datasets[0].data = tempData;
    this.tempChart.data.datasets[1].data = Array(count).fill(thresholds.tempUpper);
    this.tempChart.data.datasets[2].data = Array(count).fill(thresholds.tempLower);
    this.tempChart.update('none');

    this.humidityChart.data.labels = labels;
    this.humidityChart.data.datasets[0].data = humidityData;
    this.humidityChart.data.datasets[1].data = Array(count).fill(thresholds.humidityUpper);
    this.humidityChart.data.datasets[2].data = Array(count).fill(thresholds.humidityLower);
    this.humidityChart.update('none');
  }

  manualRefresh() {
    this.fetchData();
  }

  getSourceBadgeColor(): string {
    if (!this.device) return 'medium';
    if (this.device.source === 'both') return 'success';
    if (this.device.source === 'cloud') return 'primary';
    return 'warning';
  }

  canUseLocal(): boolean {
    return !!this.device?.localAddress;
  }
}
