interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

interface PaginationMap {
  [key: string]: PaginationState;
}

export function initSubjectPagination(assignmentsData: any[], itemsPerPage = 3): PaginationMap {
  const pagination: PaginationMap = {};
  assignmentsData.forEach(a => {
    if (!pagination[a.courseName]) {
      pagination[a.courseName] = { currentPage: 0, itemsPerPage };
    }
  });
  return pagination;
}