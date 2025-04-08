import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { useGetTaskBySalesId, Task } from '../../hooks/Tasks/useGetTaskBySalesId';
import { Search, Info, X } from 'lucide-react';
import Loading from '../../components/Loading/Loading';
import styles from './UpcomingPage.module.css';

interface TaskWithDetails extends Task {
  customerName?: string;
  actionDetails?: string;
}

const UpcomingPage: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Get employee ID from auth context
  const { employee } = useAuth();
  const { execute: fetchTasks } = useGetTaskBySalesId();

  // Load tasks when component mounts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (employee?.id) {
          const tasksData = await fetchTasks(parseInt(employee.id));
          
          // Enhance tasks with additional details
          // In a real implementation, you would fetch customer names and action details
          const tasksWithDetails = tasksData.map((task: Task) => {
            const taskWithDetails: TaskWithDetails = { ...task };
            // These would be replaced with actual API calls to get customer and action details
            taskWithDetails.customerName = `عميل ${task.customer_id}`;
            taskWithDetails.actionDetails = task.action_id ? `إجراء ${task.action_id}` : "لا يوجد إجراء مرتبط";
            return taskWithDetails;
          });
          
          setTasks(tasksWithDetails);
          setFilteredTasks(tasksWithDetails);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, [employee?.id, fetchTasks]);
  
  // Filter tasks based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = tasks.filter(task => 
        task.name.toLowerCase().includes(query) ||
        task.customerName?.toLowerCase().includes(query) ||
        task.actionDetails?.toLowerCase().includes(query)
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [searchQuery, tasks]);
  
  // Open info modal
  const openInfoModal = (task: TaskWithDetails) => {
    setSelectedTask(task);
    setIsInfoModalOpen(true);
  };
  
  // Close all modals
  const closeModals = () => {
    setIsInfoModalOpen(false);
    setSelectedTask(null);
  };
  
  // Format date
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Check if task is overdue
  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    const now = new Date();
    return new Date(dueDate) < now;
  };
  
  // Check if task is due today
  const isDueToday = (dueDate: Date | null) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className={styles.tasksPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>المهام القادمة</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <Loading isVisible={true} />
      ) : filteredTasks.length === 0 ? (
        <div className={styles.emptyState}>
          {searchQuery ? (
            <p>لا توجد نتائج مطابقة للبحث</p>
          ) : (
            <p>لا توجد مهام قادمة</p>
          )}
        </div>
      ) : (
        <div className={styles.tasksContainer}>
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={`${styles.taskCard} ${isOverdue(task.due_date) ? styles.overdueTask : isDueToday(task.due_date) ? styles.todayTask : ''}`}
            >
              <div className={styles.taskHeader}>
                <div className={styles.taskDate}>
                  {formatDate(task.due_date)}
                </div>
                <button 
                  className={styles.infoButton} 
                  onClick={() => openInfoModal(task)}
                  aria-label="معلومات"
                >
                  <Info size={18} />
                </button>
              </div>
              
              <div className={styles.taskContent}>
                <h3 className={styles.taskName}>{task.name}</h3>
                
                <div className={styles.taskDetails}>
                  {task.customer_id && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>العميل:</span>
                      <span className={styles.detailValue}>{task.customerName}</span>
                    </div>
                  )}
                  
                  {task.action_id && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>الإجراء:</span>
                      <span className={styles.detailValue}>{task.actionDetails}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.taskFooter}>
                <div className={`${styles.taskStatus} ${
                  isOverdue(task.due_date) 
                    ? styles.overdue 
                    : isDueToday(task.due_date) 
                      ? styles.today 
                      : styles.upcoming
                }`}>
                  {isOverdue(task.due_date) 
                    ? "متأخر" 
                    : isDueToday(task.due_date) 
                      ? "اليوم" 
                      : "قادم"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Info Modal */}
      {isInfoModalOpen && selectedTask && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>تفاصيل المهمة</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.infoContent}>
              <div className={styles.infoSection}>
                <h3>معلومات أساسية</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>اسم المهمة:</span>
                  <span className={styles.infoValue}>{selectedTask.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>تاريخ الاستحقاق:</span>
                  <span className={`${styles.infoValue} ${
                    isOverdue(selectedTask.due_date) 
                      ? styles.overdue 
                      : isDueToday(selectedTask.due_date) 
                        ? styles.today 
                        : ""
                  }`}>
                    {formatDate(selectedTask.due_date)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>تاريخ الإنشاء:</span>
                  <span className={styles.infoValue}>{formatDate(selectedTask.created_at)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>آخر تحديث:</span>
                  <span className={styles.infoValue}>{formatDate(selectedTask.updated_at)}</span>
                </div>
              </div>
              
              <div className={styles.infoSection}>
                <h3>العلاقات</h3>
                {selectedTask.customer_id && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>العميل:</span>
                    <span className={styles.infoValue}>{selectedTask.customerName}</span>
                  </div>
                )}
                {selectedTask.action_id && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>الإجراء:</span>
                    <span className={styles.infoValue}>{selectedTask.actionDetails}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.closeModalButton} onClick={closeModals}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingPage;