/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar, ActiveTab } from './components/AndroidNavBar';
import { ConverterTab } from './components/ConverterTab';
import { RatesTab } from './components/RatesTab';
import { SoukRyalTab } from './components/SoukRyalTab';
import { BanknotesTab } from './components/BanknotesTab';
import { TransferToolsTab } from './components/TransferToolsTab';
import { CurrencySelectorModal } from './components/CurrencySelectorModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { PriceAlertBanner } from './components/PriceAlertBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider, useAlerts } from './context/AlertContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Currency } from './types/currency';
import { INITIAL_CURRENCIES } from './data/currencies';
import { fetchLiveRates, loadFromCache } from './services/ratesService';
import { playKeypadClick, triggerVibration } from './utils/sound';

function MainApp() {
  const { checkAlertsAgainstRates } = useAlerts();
  const { detectLocation, pinnedCurrencyCode } = useLocation();
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(INITIAL_CURRENCIES[0]); // EUR default
  const [activeTab, setActiveTab] = useState<ActiveTab>('converter');
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [isOnlineSource, setIsOnlineSource] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Load cached rates immediately, then sync with live API in background
  useEffect(() => {
    const cached = loadFromCache();
    setCurrencies(cached.currencies);
    setLastUpdated(cached.lastUpdated);
    setIsOnlineSource(cached.isOnlineSource);
    checkAlertsAgainstRates(cached.currencies);

    // Honor pinned currency if set, else EUR or first available
    const initialCurr =
      (pinnedCurrencyCode && cached.currencies.find((c) => c.code === pinnedCurrencyCode)) ||
      cached.currencies.find((c) => c.code === 'EUR') ||
      cached.currencies[0];
    setSelectedCurrency(initialCurr);

    // Detect user region using browser Geolocation API
    detectLocation(cached.currencies);

    // Background live fetch
    fetchLiveRates().then((result) => {
      setCurrencies(result.currencies);
      setLastUpdated(result.lastUpdated);
      setIsOnlineSource(result.isOnlineSource);
      checkAlertsAgainstRates(result.currencies);
      const updatedSelected = result.currencies.find((c) => c.code === initialCurr.code);
      if (updatedSelected) {
        setSelectedCurrency(updatedSelected);
      }
    });
  }, [checkAlertsAgainstRates, detectLocation, pinnedCurrencyCode]);

  const handleRefreshRates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLiveRates();
      setCurrencies(result.currencies);
      setLastUpdated(result.lastUpdated);
      setIsOnlineSource(result.isOnlineSource);
      checkAlertsAgainstRates(result.currencies);
      const updated = result.currencies.find((c) => c.code === selectedCurrency.code);
      if (updated) {
        setSelectedCurrency(updated);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedCurrency.code, checkAlertsAgainstRates]);

  const handlePlayKeyClick = useCallback(() => {
    playKeypadClick(soundEnabled);
    triggerVibration();
  }, [soundEnabled]);

  const handleSelectCurrency = (curr: Currency) => {
    handlePlayKeyClick();
    setSelectedCurrency(curr);
  };

  const handleSelectForConvert = (curr: Currency) => {
    setSelectedCurrency(curr);
    setActiveTab('converter');
  };

  return (
    <AndroidFrame>
      {/* Android System Status Bar */}
      <AndroidStatusBar
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100 overflow-hidden relative">
        {activeTab === 'converter' && (
          <ConverterTab
            selectedCurrency={selectedCurrency}
            onOpenSelector={() => {
              handlePlayKeyClick();
              setIsSelectorOpen(true);
            }}
            soundEnabled={soundEnabled}
            onPlayKeyClick={handlePlayKeyClick}
            currencies={currencies}
            onSelectCurrency={handleSelectCurrency}
          />
        )}

        {activeTab === 'rates' && (
          <RatesTab
            currencies={currencies}
            lastUpdated={lastUpdated}
            isOnlineSource={isOnlineSource}
            onRefreshRates={handleRefreshRates}
            isRefreshing={isRefreshing}
            onSelectForConvert={handleSelectForConvert}
            soundEnabled={soundEnabled}
            onPlayClick={handlePlayKeyClick}
          />
        )}

        {activeTab === 'souk' && (
          <SoukRyalTab
            selectedCurrency={selectedCurrency}
            onPlayClick={handlePlayKeyClick}
          />
        )}

        {activeTab === 'banknotes' && (
          <BanknotesTab onPlayClick={handlePlayKeyClick} />
        )}

        {activeTab === 'transfer' && (
          <TransferToolsTab
            selectedCurrency={selectedCurrency}
            currencies={currencies}
            onSelectCurrency={setSelectedCurrency}
            onPlayClick={handlePlayKeyClick}
          />
        )}
      </div>

      {/* Android Bottom Navigation Bar */}
      <AndroidNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNavClickSound={handlePlayKeyClick}
      />

      {/* Currency Selector Bottom Sheet Modal */}
      <CurrencySelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        currencies={currencies}
        selectedCode={selectedCurrency.code}
        onSelect={handleSelectCurrency}
      />

      {/* Theme Selector Bottom Sheet Modal */}
      <ThemeSelectorModal onPlayClick={handlePlayKeyClick} />

      {/* Visual Rate Trigger Notification Banner */}
      <PriceAlertBanner />

      {/* Non-intrusive Offline Toast Banner */}
      <OfflineIndicator />
    </AndroidFrame>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <LocationProvider>
          <FavoritesProvider>
            <MainApp />
          </FavoritesProvider>
        </LocationProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

