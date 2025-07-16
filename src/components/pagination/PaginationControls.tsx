'use client'

import { useCallback } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationControlsProps) {
  // Generate page numbers to display
  const generatePagination = useCallback(() => {
    // Always show first and last page
    const firstPage = 1
    const lastPage = totalPages

    // Calculate range of pages to show around current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage)

    // Determine whether to show ellipses
    const shouldShowLeftDots = leftSiblingIndex > firstPage + 1
    const shouldShowRightDots = rightSiblingIndex < lastPage - 1

    // Generate the array of page numbers to display
    const pageNumbers: (number | 'ellipsis')[] = []

    // Always add first page
    pageNumbers.push(firstPage)

    // Add left ellipsis if needed
    if (shouldShowLeftDots) {
      pageNumbers.push('ellipsis')
    }

    // Add page numbers between ellipses
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== firstPage && i !== lastPage) {
        pageNumbers.push(i)
      }
    }

    // Add right ellipsis if needed
    if (shouldShowRightDots) {
      pageNumbers.push('ellipsis')
    }

    // Always add last page if it's different from first page
    if (lastPage > firstPage) {
      pageNumbers.push(lastPage)
    }

    return pageNumbers
  }, [currentPage, totalPages, siblingCount])

  const pageNumbers = generatePagination()

  return (
    <Pagination className="my-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) {
                onPageChange(currentPage - 1)
              }
            }}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(page)
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1)
              }
            }}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}