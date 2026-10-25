import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import DataMap from './pages/DataMap';
import ReportForm from './pages/ReportForm';
import ReportReceipt from './pages/ReportReceipt';
import TrackReport from './pages/TrackReport';
import MyReports from './pages/MyReports';
import { getMyReports } from './utils/storage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [preselectedRegionKode, setPreselectedRegionKode] = useState('');
  const [prefilledReportData, setPrefilledReportData] = useState(null);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [lookupCode, setLookupCode] = useState('');
  const [myReportsCount, setMyReportsCount] = useState(0);

  // Update badge count
  useEffect(() => {
    const list = getMyReports();
    setMyReportsCount(list.length);
  }, [activePage]);

  // Scroll to top on page transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F7] text-[#1A1F1C]">
      {/* Top Navbar & Mobile Bottom Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        myReportsCount={myReportsCount}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activePage === 'home' && (
          <Home
            setActivePage={setActivePage}
            setSelectedRegionKode={setPreselectedRegionKode}
          />
        )}

        {activePage === 'data' && (
          <DataMap
            setActivePage={setActivePage}
            preselectedKode={preselectedRegionKode}
            setPrefilledReportData={setPrefilledReportData}
          />
        )}

        {activePage === 'report' && (
          <ReportForm
            setActivePage={setActivePage}
            setSubmittedReport={setSubmittedReport}
            prefilledData={prefilledReportData}
          />
        )}

        {activePage === 'receipt' && (
          <ReportReceipt
            report={submittedReport}
            setActivePage={setActivePage}
            setLookupCode={setLookupCode}
          />
        )}

        {activePage === 'track' && (
          <TrackReport
            initialCode={lookupCode}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'my-reports' && (
          <MyReports
            setActivePage={setActivePage}
            setLookupCode={setLookupCode}
          />
        )}
      </main>

      {/* Persistent Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
