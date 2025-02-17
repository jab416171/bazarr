import { ActionButton, PageTable } from "@/components";
import { useModalControl } from "@/modules/modals";
import { faClock, faHistory, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, useMemo } from "react";
import { ButtonGroup } from "react-bootstrap";
import { Column } from "react-table";
import SystemBackupDeleteModal from "./BackupDeleteModal";
import SystemBackupRestoreModal from "./BackupRestoreModal";

interface Props {
  backups: readonly System.Backups[];
}

const Table: FunctionComponent<Props> = ({ backups }) => {
  const columns: Column<System.Backups>[] = useMemo<Column<System.Backups>[]>(
    () => [
      {
        accessor: "type",
        Cell: <FontAwesomeIcon icon={faClock}></FontAwesomeIcon>,
      },
      {
        Header: "Name",
        accessor: "filename",
        className: "text-nowrap",
      },
      {
        Header: "Size",
        accessor: "size",
        className: "text-nowrap",
      },
      {
        Header: "Time",
        accessor: "date",
        className: "text-nowrap",
      },
      {
        accessor: "id",
        Cell: (row) => {
          const { show } = useModalControl();
          return (
            <ButtonGroup>
              <ActionButton
                icon={faHistory}
                onClick={() =>
                  show(SystemBackupRestoreModal, row.row.original.filename)
                }
              ></ActionButton>
              <ActionButton
                icon={faTrash}
                onClick={() =>
                  show(SystemBackupDeleteModal, row.row.original.filename)
                }
              ></ActionButton>
            </ButtonGroup>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <PageTable columns={columns} data={backups}></PageTable>
      <SystemBackupRestoreModal></SystemBackupRestoreModal>
      <SystemBackupDeleteModal></SystemBackupDeleteModal>
    </React.Fragment>
  );
};

export default Table;
