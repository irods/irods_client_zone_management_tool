import { ArrowDownIcon, ArrowUpIcon } from ".";

export const TableSortLabel = ({ children, active, direction, onClick }) => (
  <button onClick={onClick} className="table_sort_label">
    {children}
    {active &&
      (direction === "asc" ? (
        <ArrowUpIcon style={{ fontSize: "18px" }} />
      ) : (
        <ArrowDownIcon style={{ fontSize: "18px" }} />
      ))}
  </button>
);

export const TablePagination = ({
  style,
  page,
  count,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
}) => (
  <div style={{ padding: 16, ...style }}>
    <p>Rows per page: </p>
    <select
      id="select-rows-per-page"
      value={`${rowsPerPage}`}
      style={{ width: 50, margin: "0 10px" }}
      onChange={onChangeRowsPerPage}
    >
      <option value="10">10</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
    <p>{`${page * rowsPerPage + 1}-${Math.min(count, (page + 1) * rowsPerPage)} of ${count}`}</p>
    <button
      style={{ margin: "0 10px" }}
      onClick={(e) => onChangePage(e, page - 1)}
      disabled={page === 0}
    >
      {"<"}
    </button>
    <button
      style={{ margin: "0 10px" }}
      onClick={(e) => onChangePage(e, page + 1)}
      disabled={count < (page + 1) * rowsPerPage}
    >
      {">"}
    </button>
  </div>
);

/*
          <TablePagination
            style={styles.pagination}
            page={currPage - 1}
            count={parseInt(zoneContext.length)}
            rowsPerPage={perPage}
            onChangePage={(event, value) => {
              setCurrPage(value + 1);
            }}
            onChangeRowsPerPage={(e) => {
              setPerPage(e.target.value);
              setCurrPage(1);
              localStorage.setItem(serversPageKey, e.target.value);
            }}
          />
 */
