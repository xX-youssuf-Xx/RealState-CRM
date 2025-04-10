"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  Filter,
  Info,
  Grid,
  List,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGetUnitByProjectId } from "../../hooks/Units/useGetUnitByProjectId";
import { useCreateUnit } from "../../hooks/Units/useCreateUnit";
import { useUpdateUnit } from "../../hooks/Units/useUpdateUnit";
import { useDeleteUnit } from "../../hooks/Units/useDeleteUnit";
import {
  type Unit,
  type UnitStatus,
  unitStatusTranslations,
  type FilterOptions,
} from "../../types/units";
import styles from "./UnitPage.module.css";
import Loading from "../../components/Loading/Loading";

// Format currency to readable format
const formatCurrency = (price: string | number) => {
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;
  return new Intl.NumberFormat("ar-EG").format(numPrice) + " جنيه";
};

// Format area to readable format
const formatArea = (area: string | number) => {
  const numArea = typeof area === "string" ? Number.parseFloat(area) : area;
  return numArea.toFixed(1) + " م²";
};

// Format date to Arabic format
const formatDate = (dateString: string | null) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("ar-EG", options);
};

// Parse query parameters from URL
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const initialFilterOptions: FilterOptions = {
  status: null,
  minArea: null,
  maxArea: null,
  minPrice: null,
  maxPrice: null,
};

const ProjectUnitsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const query = useQuery();
  const projectName = query.get("name") || "المشروع";

  const [units, setUnits] = useState<Unit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(initialFilterOptions);
  const [isFiltered, setIsFiltered] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    price: "",
    unit_notes: "",
    status: "AVAILABLE" as UnitStatus,
    sold_date: null as string | null,
  });

  const { execute: fetchUnits, isLoading: isLoadingUnits } =
    useGetUnitByProjectId();
  const { execute: createUnit, isLoading: isCreating } = useCreateUnit();
  const { execute: updateUnit, isLoading: isUpdating } = useUpdateUnit();
  const { execute: deleteUnit, isLoading: isDeleting } = useDeleteUnit();

  // Fetch units on component mount
  useEffect(() => {
    if (projectId) {
      loadUnits();
    }
  }, [projectId]);

  const loadUnits = async () => {
    if (!projectId) return;
    try {
      const data = await fetchUnits(Number(projectId));
      setUnits(data);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحميل بيانات الوحدات");
    }
  };

  // Filter and sort units
  const filteredAndSortedUnits = useMemo(() => {
    // First filter by search query
    let filtered = units.filter((unit) =>
      unit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply additional filters if any are set
    if (filterOptions.status) {
      filtered = filtered.filter(
        (unit) => unit.status === filterOptions.status
      );
    }
    if (filterOptions.minArea !== null) {
      filtered = filtered.filter(
        (unit) => Number.parseFloat(unit.area) >= (filterOptions.minArea || 0)
      );
    }
    if (filterOptions.maxArea !== null) {
      filtered = filtered.filter(
        (unit) =>
          Number.parseFloat(unit.area) <=
          (filterOptions.maxArea || Number.POSITIVE_INFINITY)
      );
    }
    if (filterOptions.minPrice !== null) {
      filtered = filtered.filter(
        (unit) => Number.parseFloat(unit.price) >= (filterOptions.minPrice || 0)
      );
    }
    if (filterOptions.maxPrice !== null) {
      filtered = filtered.filter(
        (unit) =>
          Number.parseFloat(unit.price) <=
          (filterOptions.maxPrice || Number.POSITIVE_INFINITY)
      );
    }

    // Sort by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [units, searchQuery, filterOptions]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "status" && value === "SOLD" && !formData.sold_date) {
      // If status is changed to SOLD and sold_date is not set, set it to today
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        [name]: value as UnitStatus,
        sold_date: today,
      }));
    } else if (name === "status" && value !== "SOLD") {
      // If status is changed from SOLD, clear sold_date
      setFormData((prev) => ({
        ...prev,
        [name]: value as UnitStatus,
        sold_date: null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "status") {
      setFilterOptions((prev) => ({
        ...prev,
        [name]: value ? (value as UnitStatus) : null,
      }));
    } else {
      // For numeric inputs
      const numValue = value ? Number.parseFloat(value) : null;
      setFilterOptions((prev) => ({ ...prev, [name]: numValue }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const openCreateModal = () => {
    setSelectedUnit(null);
    setFormData({
      name: "",
      area: "",
      price: "",
      unit_notes: "",
      status: "AVAILABLE",
      sold_date: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormData({
      name: unit.name,
      area: unit.area,
      price: unit.price,
      unit_notes: unit.unit_notes || "",
      status: unit.status || "AVAILABLE",
      sold_date: unit.sold_date,
    });
    setIsModalOpen(true);
  };

  const openInfoModal = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsInfoModalOpen(true);
  };

  const openDeleteModal = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteModalOpen(true);
  };

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsInfoModalOpen(false);
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setFilterOptions(initialFilterOptions);
    setIsFiltered(false);
  };

  const applyFilters = () => {
    setIsFiltered(Object.values(filterOptions).some((value) => value !== null));
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !projectId ||
      !formData.name ||
      formData.area === "" ||
      formData.price === ""
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      if (selectedUnit) {
        // Update existing unit
        await updateUnit(
          Number(selectedUnit.id),
          undefined, // project_id doesn't change
          formData.name,
          Number.parseFloat(formData.area),
          Number.parseFloat(formData.price),
          formData.unit_notes || undefined,
          formData.status,
          formData.sold_date
        );
        toast.success("تم تحديث بيانات الوحدة بنجاح");
      } else {
        // Create new unit
        await createUnit(
          Number(projectId),
          formData.name,
          Number.parseFloat(formData.area),
          Number.parseFloat(formData.price),
          formData.status,
          formData.unit_notes || undefined,
          formData.sold_date
        );
        toast.success("تم إضافة الوحدة بنجاح");
      }

      closeModal();
      loadUnits();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حفظ بيانات الوحدة");
    }
  };

  const handleDelete = async () => {
    if (!selectedUnit) return;

    try {
      await deleteUnit(Number(selectedUnit.id));
      toast.success("تم حذف الوحدة بنجاح");
      closeModal();
      loadUnits();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف الوحدة");
    }
  };

  // Get CSS class based on unit status for card view
  const getUnitCardClass = (status: UnitStatus | null) => {
    if (status === "AVAILABLE") {
      return `${styles.unitCard} ${styles.availableUnit}`;
    } else if (status === "RESERVED") {
      return `${styles.unitCard} ${styles.reservedUnit}`;
    } else if (status === "SOLD") {
      return `${styles.unitCard} ${styles.soldUnit}`;
    }
    return styles.unitCard;
  };

  // Get CSS class based on unit status for list view
  const getUnitListItemClass = (status: UnitStatus | null) => {
    if (status === "AVAILABLE") {
      return `${styles.unitListItem} ${styles.availableListItem}`;
    } else if (status === "RESERVED") {
      return `${styles.unitListItem} ${styles.reservedListItem}`;
    } else if (status === "SOLD") {
      return `${styles.unitListItem} ${styles.soldListItem}`;
    }
    return styles.unitListItem;
  };

  return (
    <div className={styles.unitsPage}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>وحدات المشروع</h1>
          <h2 className={styles.projectName}>{projectName}</h2>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="بحث بالاسم..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                viewMode === "cards" ? styles.activeView : ""
              }`}
              onClick={() => setViewMode("cards")}
              aria-label="عرض البطاقات"
            >
              <Grid size={18} />
            </button>
            <button
              className={`${styles.viewButton} ${
                viewMode === "list" ? styles.activeView : ""
              }`}
              onClick={() => setViewMode("list")}
              aria-label="عرض القائمة"
            >
              <List size={18} />
            </button>
          </div>
          <button className={styles.filterButton} onClick={openFilterModal}>
            <Filter size={18} />
            <span>تصفية</span>
            {isFiltered && <span className={styles.filterBadge}></span>}
          </button>
          <button
            className={styles.addButton}
            onClick={openCreateModal}
            disabled={isLoadingUnits}
          >
            <Plus size={18} />
            <span>إضافة وحدة</span>
          </button>
        </div>
      </div>

      {isLoadingUnits ? (
        <Loading isVisible={true} />
      ) : filteredAndSortedUnits.length === 0 ? (
        <div className={styles.emptyState}>
          {searchQuery || isFiltered ? (
            <>
              <p>لا توجد نتائج مطابقة للبحث</p>
              {isFiltered && (
                <button className={styles.resetButton} onClick={resetFilters}>
                  إعادة ضبط التصفية
                </button>
              )}
            </>
          ) : (
            <>
              <p>لا توجد وحدات في هذا المشروع حالياً</p>
              <button className={styles.addButton} onClick={openCreateModal}>
                <Plus size={18} />
                <span>إضافة وحدة</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {isFiltered && (
            <div className={styles.filterIndicator}>
              <span>تم تطبيق التصفية</span>
              <button className={styles.resetButton} onClick={resetFilters}>
                إعادة ضبط
              </button>
            </div>
          )}
          {viewMode === "cards" ? (
            <div className={styles.unitsGrid}>
              {filteredAndSortedUnits.map((unit) => (
                <div key={unit.id} className={getUnitCardClass(unit.status)}>
                  <div
                    className={`${styles.unitHeader} ${
                      unit.status
                        ? styles[unit.status.toLowerCase() + "Header"]
                        : ""
                    }`}
                  >
                    <h3 className={styles.unitName}>{unit.name}</h3>
                    <div className={styles.actions}>
                      <button
                        className={styles.infoButton}
                        onClick={() => openInfoModal(unit)}
                        aria-label="معلومات"
                      >
                        <Info size={18} />
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={() => openEditModal(unit)}
                        aria-label="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => openDeleteModal(unit)}
                        aria-label="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.unitDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>المساحة:</span>
                      <span className={styles.detailValue}>
                        {formatArea(unit.area)}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>السعر:</span>
                      <span className={styles.detailValue}>
                        {formatCurrency(unit.price)}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>الحالة:</span>
                      <span
                        className={`${styles.detailValue} ${
                          unit.status
                            ? styles[unit.status.toLowerCase() + "Status"]
                            : ""
                        }`}
                      >
                        {unit.status
                          ? unitStatusTranslations[unit.status]
                          : "غير محدد"}
                      </span>
                    </div>
                    {unit.status === "SOLD" && unit.sold_date && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>تاريخ البيع:</span>
                        <span className={styles.detailValue}>
                          {formatDate(unit.sold_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.unitsList}>
              {filteredAndSortedUnits.map((unit) => (
                <div
                  key={unit.id}
                  className={getUnitListItemClass(unit.status)}
                >
                  <div className={styles.unitListHeader}>
                    <h3 className={styles.unitName}>{unit.name}</h3>
                    <div className={styles.actions}>
                      <button
                        className={styles.infoButton}
                        onClick={() => openInfoModal(unit)}
                        aria-label="معلومات"
                      >
                        <Info size={18} />
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={() => openEditModal(unit)}
                        aria-label="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => openDeleteModal(unit)}
                        aria-label="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.unitListContent}>
                    <div className={styles.unitListDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>المساحة:</span>
                        <span className={styles.detailValue}>
                          {formatArea(unit.area)}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>السعر:</span>
                        <span className={styles.detailValue}>
                          {formatCurrency(unit.price)}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>الحالة:</span>
                        <span
                          className={`${styles.detailValue} ${
                            unit.status
                              ? styles[unit.status.toLowerCase() + "Status"]
                              : ""
                          }`}
                        >
                          {unit.status
                            ? unitStatusTranslations[unit.status]
                            : "غير محدد"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Unit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                {selectedUnit ? "تعديل بيانات الوحدة" : "إضافة وحدة جديدة"}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">اسم الوحدة</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل اسم الوحدة"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="area">المساحة (م²)</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  min="0"
                  placeholder="أدخل المساحة"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="price">السعر (جنيه)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="أدخل السعر"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status">الحالة</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  {Object.entries(unitStatusTranslations).map(
                    ([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    )
                  )}
                </select>
              </div>

              {formData.status === "SOLD" && (
                <div className={styles.formGroup}>
                  <label htmlFor="sold_date">تاريخ البيع</label>
                  <input
                    type="date"
                    id="sold_date"
                    name="sold_date"
                    value={formData.sold_date || ""}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="unit_notes">ملاحظات</label>
                <textarea
                  id="unit_notes"
                  name="unit_notes"
                  value={formData.unit_notes}
                  onChange={handleInputChange}
                  placeholder="أدخل ملاحظات (اختياري)"
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={isCreating || isUpdating}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loading isVisible={true} />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{selectedUnit ? "تحديث" : "إضافة"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Info Modal */}
      {isInfoModalOpen && selectedUnit && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div
              className={`${styles.modalHeader} ${
                selectedUnit.status
                  ? styles[selectedUnit.status.toLowerCase() + "Header"]
                  : ""
              }`}
            >
              <h2>معلومات الوحدة</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.infoContent}>
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>المعلومات الأساسية</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>الرقم التعريفي:</span>
                  <span className={styles.infoValue}>{selectedUnit.id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>اسم الوحدة:</span>
                  <span className={styles.infoValue}>{selectedUnit.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>المساحة:</span>
                  <span className={styles.infoValue}>
                    {formatArea(selectedUnit.area)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>السعر:</span>
                  <span className={styles.infoValue}>
                    {formatCurrency(selectedUnit.price)}
                  </span>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>حالة الوحدة</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>الحالة:</span>
                  <span
                    className={`${styles.infoValue} ${
                      selectedUnit.status
                        ? styles[selectedUnit.status.toLowerCase() + "Status"]
                        : ""
                    }`}
                  >
                    {selectedUnit.status
                      ? unitStatusTranslations[selectedUnit.status]
                      : "غير محدد"}
                  </span>
                </div>
                {selectedUnit.status === "SOLD" && selectedUnit.sold_date && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>تاريخ البيع:</span>
                    <span className={styles.infoValue}>
                      {formatDate(selectedUnit.sold_date)}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>معلومات إضافية</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>تاريخ الإنشاء:</span>
                  <span className={styles.infoValue}>
                    {formatDate(selectedUnit.created_at)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>آخر تحديث:</span>
                  <span className={styles.infoValue}>
                    {formatDate(selectedUnit.updated_at)}
                  </span>
                </div>
              </div>

              {selectedUnit.unit_notes && (
                <div className={styles.infoSection}>
                  <h3 className={styles.sectionTitle}>ملاحظات</h3>
                  <div className={styles.notesBox}>
                    {selectedUnit.unit_notes}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.infoActions}>
              <button className={styles.closeInfoButton} onClick={closeModal}>
                إغلاق
              </button>
              <button
                className={styles.editInfoButton}
                onClick={() => {
                  closeModal();
                  openEditModal(selectedUnit);
                }}
              >
                تعديل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>تصفية الوحدات</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.filterForm}>
              <div className={styles.formGroup}>
                <label htmlFor="status">الحالة</label>
                <select
                  id="status"
                  name="status"
                  value={filterOptions.status || ""}
                  onChange={handleFilterChange}
                >
                  <option value="">الكل</option>
                  {Object.entries(unitStatusTranslations).map(
                    ([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className={styles.formGroupRow}>
                <div className={styles.formGroupHalf}>
                  <label htmlFor="minArea">المساحة (من)</label>
                  <input
                    type="number"
                    id="minArea"
                    name="minArea"
                    value={filterOptions.minArea || ""}
                    onChange={handleFilterChange}
                    min="0"
                    step="0.1"
                    placeholder="أقل مساحة"
                  />
                </div>
                <div className={styles.formGroupHalf}>
                  <label htmlFor="maxArea">المساحة (إلى)</label>
                  <input
                    type="number"
                    id="maxArea"
                    name="maxArea"
                    value={filterOptions.maxArea || ""}
                    onChange={handleFilterChange}
                    min="0"
                    step="0.1"
                    placeholder="أكبر مساحة"
                  />
                </div>
              </div>

              <div className={styles.formGroupRow}>
                <div className={styles.formGroupHalf}>
                  <label htmlFor="minPrice">السعر (من)</label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    value={filterOptions.minPrice || ""}
                    onChange={handleFilterChange}
                    min="0"
                    placeholder="أقل سعر"
                  />
                </div>
                <div className={styles.formGroupHalf}>
                  <label htmlFor="maxPrice">السعر (إلى)</label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    value={filterOptions.maxPrice || ""}
                    onChange={handleFilterChange}
                    min="0"
                    placeholder="أكبر سعر"
                  />
                </div>
              </div>

              <div className={styles.filterActions}>
                <button
                  type="button"
                  className={styles.resetFilterButton}
                  onClick={resetFilters}
                >
                  إعادة ضبط
                </button>
                <button
                  type="button"
                  className={styles.applyFilterButton}
                  onClick={applyFilters}
                >
                  تطبيق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUnit && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h2>تأكيد الحذف</h2>
            <p>
              هل أنت متأكد من رغبتك في حذف الوحدة "{selectedUnit.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={closeModal}
                disabled={isDeleting}
              >
                إلغاء
              </button>
              <button
                className={styles.deleteConfirmButton}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loading isVisible={true} />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <span>تأكيد الحذف</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectUnitsPage;
