// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useGetSalesReports } from '../../hooks/Reports/useGetSalesReports'; // Adjust path if needed
import { useGetAllReports } from '../../hooks/Reports/useGetAllReports';   // Adjust path if needed
import Loading from '../../components/Loading/Loading'; // Assuming you have a Loading component
import styles from './DashboardPage.module.css'; // Import the CSS module

// Define the expected data structure from the API hooks
interface ReportData {
  totalSales: number;
  unitsSold: number;
}

const DashboardPage: React.FC = () => {
  // State for the report data
  const [myReportData, setMyReportData] = useState<ReportData | null>(null);
  const [allReportData, setAllReportData] = useState<ReportData | null>(null);

  // Fetch hooks
  const {
    execute: fetchMyReports,
    isLoading: isLoadingMyReports,
    error: errorMyReports,
    data: rawMyData, // Raw data from hook
  } = useGetSalesReports();

  const {
    execute: fetchAllReports,
    isLoading: isLoadingAllReports,
    error: errorAllReports,
    data: rawAllData, // Raw data from hook
  } = useGetAllReports();

  // Fetch data on component mount
  useEffect(() => {
    fetchMyReports();
    fetchAllReports();
  }, [fetchMyReports, fetchAllReports]);

  // Update state when raw data changes
   useEffect(() => {
    if (rawMyData) {
      setMyReportData(rawMyData);
    }
  }, [rawMyData]);

  useEffect(() => {
    if (rawAllData) {
      setAllReportData(rawAllData);
    }
  }, [rawAllData]);


  const isLoading = isLoadingMyReports || isLoadingAllReports;

  // Helper to format numbers (optional)
  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0'; // Or 'N/A'
    return num.toLocaleString('ar-EG'); // Format with Arabic numerals if desired
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.pageTitle}>لوحة التحكم</h1>

      {isLoading && <Loading isVisible={true} />}

      {errorMyReports && <div className={styles.error}>خطأ في تحميل تقارير حسابي: {errorMyReports.message}</div>}
      {errorAllReports && <div className={styles.error}>خطأ في تحميل التقارير العامة: {errorAllReports.message}</div>}

      {!isLoading && (
        <div className={styles.cardsGrid}>
          {/* Card 1: My Total Sales */}
          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              إجمالي مبيعاتي
            </div>
            <div className={styles.cardBody}>
              <span className={styles.statValue}>
                {formatNumber(myReportData?.totalSales)}
              </span>
              {/* Optionally add currency */}
              {/* <span className={styles.statLabel}> ريال</span> */}
            </div>
          </div>

          {/* Card 2: My Units Sold */}
          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              الوحدات المباعة (حسابي)
            </div>
            <div className={styles.cardBody}>
              <span className={styles.statValue}>
                {formatNumber(myReportData?.unitsSold)}
              </span>
              <span className={styles.statLabel}> وحدة</span>
            </div>
          </div>

          {/* Card 3: All Total Sales */}
          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              إجمالي المبيعات (الكل)
            </div>
            <div className={styles.cardBody}>
              <span className={styles.statValue}>
                {formatNumber(allReportData?.totalSales)}
              </span>
               {/* <span className={styles.statLabel}> ريال</span> */}
            </div>
          </div>

          {/* Card 4: All Units Sold */}
          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              الوحدات المباعة (الكل)
            </div>
            <div className={styles.cardBody}>
              <span className={styles.statValue}>
                {formatNumber(allReportData?.unitsSold)}
              </span>
              <span className={styles.statLabel}> وحدة</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;