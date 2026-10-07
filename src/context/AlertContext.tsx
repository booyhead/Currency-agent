import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PriceAlert, AlertCondition } from '../types/alert';
import { Currency } from '../types/currency';
import { triggerVibration } from '../utils/sound';

const ALERTS_STORAGE_KEY = 'dirhampay_price_alerts_v1';

interface AlertContextType {
  alerts: PriceAlert[];
  addAlert: (currencyCode: string, targetRate: number, condition: AlertCondition) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  checkAlertsAgainstRates: (currencies: Currency[]) => void;
  activeNotifications: PriceAlert[];
  dismissNotification: (id: string) => void;
  simulateTrigger: (currencyCode: string, currentRate: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activeNotifications, setActiveNotifications] = useState<PriceAlert[]>([]);

  // Persist alerts
  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch {
      // ignore
    }
  }, [alerts]);

  const addAlert = useCallback((currencyCode: string, targetRate: number, condition: AlertCondition) => {
    const newAlert: PriceAlert = {
      id: `${currencyCode}-${Date.now()}`,
      currencyCode,
      targetRate: Number(targetRate.toFixed(4)),
      condition,
      createdAt: new Date().toISOString(),
      isActive: true,
      isTriggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setActiveNotifications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive, isTriggered: false } : a))
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setActiveNotifications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const checkAlertsAgainstRates = useCallback((currencies: Currency[]) => {
    const newlyTriggered: PriceAlert[] = [];

    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) => {
        if (!alert.isActive || alert.isTriggered) return alert;

        const currency = currencies.find((c) => c.code === alert.currencyCode);
        if (!currency) return alert;

        const currentRate = currency.rateToMad;
        const isCrossed =
          alert.condition === 'ABOVE_OR_EQUAL'
            ? currentRate >= alert.targetRate
            : currentRate <= alert.targetRate;

        if (isCrossed) {
          const triggeredAlert: PriceAlert = {
            ...alert,
            isTriggered: true,
            triggeredAt: new Date().toISOString(),
            currentRateAtTrigger: currentRate,
          };
          newlyTriggered.push(triggeredAlert);
          return triggeredAlert;
        }

        return alert;
      })
    );

    if (newlyTriggered.length > 0) {
      triggerVibration();
      setActiveNotifications((prev) => [...newlyTriggered, ...prev]);
    }
  }, []);

  const simulateTrigger = useCallback((currencyCode: string, currentRate: number) => {
    const mockAlert: PriceAlert = {
      id: `sim-${Date.now()}`,
      currencyCode,
      targetRate: currentRate,
      condition: 'ABOVE_OR_EQUAL',
      createdAt: new Date().toISOString(),
      isActive: true,
      isTriggered: true,
      triggeredAt: new Date().toISOString(),
      currentRateAtTrigger: currentRate,
    };
    triggerVibration();
    setActiveNotifications((prev) => [mockAlert, ...prev]);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        addAlert,
        removeAlert,
        toggleAlert,
        checkAlertsAgainstRates,
        activeNotifications,
        dismissNotification,
        simulateTrigger,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return ctx;
}
