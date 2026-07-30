'use client';

import { useEffect, useState } from 'react';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { type MobileCapabilitySlug } from './mobile-capability-catalog';

type BrowserSnapshot = {
  serviceWorker: boolean;
  barcodeDetector: boolean;
  camera: boolean;
  geolocation: boolean;
  pushManager: boolean;
  notificationPermission: string;
  indexedDb: boolean;
  online: boolean;
  standalone: boolean;
  prefersDark: boolean;
  touchPoints: number;
};

type BrowserRow = {
  label: string;
  value: string;
};

const defaultSnapshot: BrowserSnapshot = {
  serviceWorker: false,
  barcodeDetector: false,
  camera: false,
  geolocation: false,
  pushManager: false,
  notificationPermission: 'unsupported',
  indexedDb: false,
  online: true,
  standalone: false,
  prefersDark: false,
  touchPoints: 0,
};

const yesNo = (value: boolean) => (value ? 'Supported' : 'Unavailable');

function buildRows(capabilitySlug: MobileCapabilitySlug, snapshot: BrowserSnapshot): BrowserRow[] {
  switch (capabilitySlug) {
    case 'pwa':
      return [
        { label: 'Service Worker', value: yesNo(snapshot.serviceWorker) },
        { label: 'IndexedDB', value: yesNo(snapshot.indexedDb) },
        { label: 'Standalone Display', value: snapshot.standalone ? 'Active' : 'Browser tab' },
        { label: 'Online State', value: snapshot.online ? 'Online' : 'Offline' },
      ];
    case 'offline-sync':
      return [
        { label: 'IndexedDB', value: yesNo(snapshot.indexedDb) },
        { label: 'Service Worker', value: yesNo(snapshot.serviceWorker) },
        { label: 'Online State', value: snapshot.online ? 'Online' : 'Offline' },
        { label: 'Touch Points', value: `${snapshot.touchPoints}` },
      ];
    case 'barcode':
      return [
        { label: 'Barcode Detector', value: yesNo(snapshot.barcodeDetector) },
        { label: 'Camera Access', value: yesNo(snapshot.camera) },
        { label: 'Touch Points', value: `${snapshot.touchPoints}` },
        { label: 'Online State', value: snapshot.online ? 'Online' : 'Offline' },
      ];
    case 'qr':
      return [
        { label: 'Barcode Detector', value: yesNo(snapshot.barcodeDetector) },
        { label: 'Camera Access', value: yesNo(snapshot.camera) },
        { label: 'Standalone Mode', value: snapshot.standalone ? 'Active' : 'Browser tab' },
        { label: 'Touch Points', value: `${snapshot.touchPoints}` },
      ];
    case 'camera':
      return [
        { label: 'getUserMedia', value: yesNo(snapshot.camera) },
        { label: 'Service Worker', value: yesNo(snapshot.serviceWorker) },
        { label: 'Touch Points', value: `${snapshot.touchPoints}` },
        { label: 'Online State', value: snapshot.online ? 'Online' : 'Offline' },
      ];
    case 'gps':
      return [
        { label: 'Geolocation', value: yesNo(snapshot.geolocation) },
        { label: 'Online State', value: snapshot.online ? 'Online' : 'Offline' },
        { label: 'Push Manager', value: yesNo(snapshot.pushManager) },
        { label: 'Touch Points', value: `${snapshot.touchPoints}` },
      ];
    case 'push-notification':
      return [
        { label: 'Notification API', value: snapshot.notificationPermission },
        { label: 'Push Manager', value: yesNo(snapshot.pushManager) },
        { label: 'Service Worker', value: yesNo(snapshot.serviceWorker) },
        { label: 'Standalone Mode', value: snapshot.standalone ? 'Active' : 'Browser tab' },
      ];
    case 'dark-mode':
      return [
        { label: 'Prefers Dark', value: snapshot.prefersDark ? 'Yes' : 'No' },
        { label: 'Touch Points', value: `${snapshot.touchPoints}` },
        { label: 'Standalone Mode', value: snapshot.standalone ? 'Active' : 'Browser tab' },
        { label: 'Online State', value: snapshot.online ? 'Online' : 'Offline' },
      ];
    case 'tablet-ui':
      return [
        { label: 'Touch Points', value: `${snapshot.touchPoints}` },
        { label: 'Service Worker', value: yesNo(snapshot.serviceWorker) },
        { label: 'Camera Access', value: yesNo(snapshot.camera) },
        { label: 'Prefers Dark', value: snapshot.prefersDark ? 'Yes' : 'No' },
      ];
    case 'warehouse-ui':
      return [
        { label: 'Barcode Detector', value: yesNo(snapshot.barcodeDetector) },
        { label: 'Camera Access', value: yesNo(snapshot.camera) },
        { label: 'Geolocation', value: yesNo(snapshot.geolocation) },
        { label: 'Touch Points', value: `${snapshot.touchPoints}` },
      ];
  }
}

export function BrowserCapabilityPanel({
  capabilitySlug,
}: {
  capabilitySlug: MobileCapabilitySlug;
}) {
  const [snapshot, setSnapshot] = useState<BrowserSnapshot>(defaultSnapshot);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const nextSnapshot: BrowserSnapshot = {
      serviceWorker: 'serviceWorker' in navigator,
      barcodeDetector: 'BarcodeDetector' in window,
      camera: 'mediaDevices' in navigator,
      geolocation: 'geolocation' in navigator,
      pushManager: 'PushManager' in window,
      notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported',
      indexedDb: 'indexedDB' in window,
      online: navigator.onLine,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      touchPoints: navigator.maxTouchPoints ?? 0,
    };

    setSnapshot(nextSnapshot);
    setReady(true);
  }, []);

  const rows = buildRows(capabilitySlug, snapshot);
  const capabilityTone = rows.some((row) => row.value === 'Unavailable') ? 'warning' : 'success';

  return (
    <SurfaceCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted">Browser Check</p>
          <h3 className="text-xl font-semibold">Runtime capability detection</h3>
        </div>
        <StatusBadge tone={ready ? capabilityTone : 'neutral'}>
          {ready ? 'Detected' : 'Waiting'}
        </StatusBadge>
      </div>
      <p className="text-sm leading-6 text-muted">
        Panel ini membaca kemampuan browser dan device saat ini untuk membantu sanity-check apakah
        surface mobile yang dipilih siap dipakai di perangkat ini.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{row.label}</p>
            <p className="mt-2 text-lg font-semibold">{row.value}</p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
