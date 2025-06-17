import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages are less than or equal to maxVisiblePages
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);

            if (currentPage > 3) {
                pageNumbers.push('...');
            }

            // Show current page and surrounding pages
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }

            // Always show last page
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    return (
        <div className={styles.pagination}>
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className={styles.navButton}
            >
                «
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.navButton}
            >
                ‹
            </button>

            {getPageNumbers().map((pageNum, index) => (
                <button
                    key={index}
                    onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : null}
                    className={`${styles.pageButton} ${pageNum === currentPage ? styles.active : ''} ${typeof pageNum !== 'number' ? styles.ellipsis : ''}`}
                    disabled={typeof pageNum !== 'number'}
                >
                    {pageNum}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.navButton}
            >
                ›
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={styles.navButton}
            >
                »
            </button>
        </div>
    );
};

export default Pagination; 