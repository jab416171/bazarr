import { useMovieSubtitleModification } from "@/apis/hooks";
import { useShowOnlyDesired } from "@/apis/hooks/site";
import { Action, SimpleTable } from "@/components";
import Language from "@/components/bazarr/Language";
import SubtitleToolsMenu from "@/components/SubtitleToolsMenu";
import { createAndDispatchTask } from "@/modules/task";
import { filterSubtitleBy } from "@/utilities";
import { useProfileItemsToLanguages } from "@/utilities/languages";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { Badge, Text } from "@mantine/core";
import { FunctionComponent, useMemo } from "react";
import { Column } from "react-table";

const missingText = "Missing Subtitles";

interface Props {
  movie: Item.Movie | null;
  disabled?: boolean;
  profile?: Language.Profile;
}

const Table: FunctionComponent<Props> = ({ movie, profile, disabled }) => {
  const onlyDesired = useShowOnlyDesired();

  const profileItems = useProfileItemsToLanguages(profile);

  const columns: Column<Subtitle>[] = useMemo<Column<Subtitle>[]>(
    () => [
      {
        Header: "Subtitle Path",
        accessor: "path",
        Cell: ({ value }) => {
          if (value === null || value.length === 0) {
            return "Video File Subtitle Track";
          } else if (value === missingText) {
            return <Text color="dimmed">{value}</Text>;
          } else {
            return value;
          }
        },
      },
      {
        Header: "Language",
        accessor: "name",
        Cell: ({ row }) => {
          if (row.original.path === missingText) {
            return (
              <Badge color="primary">
                <Language.Text value={row.original} long></Language.Text>
              </Badge>
            );
          } else {
            return (
              <Badge color="secondary">
                <Language.Text value={row.original} long></Language.Text>
              </Badge>
            );
          }
        },
      },
      {
        accessor: "code2",
        Cell: (row) => {
          const {
            original: { code2, path, hi, forced },
          } = row.row;

          const { download, remove } = useMovieSubtitleModification();

          const selections = useMemo(() => {
            const list: FormType.ModifySubtitle[] = [];

            if (path !== null && path !== missingText && movie !== null) {
              list.push({
                type: "movie",
                path,
                id: movie.radarrId,
                language: code2,
              });
            }

            return list;
          }, [code2, path]);

          if (movie === null) {
            return null;
          }

          const { radarrId } = movie;

          return (
            <SubtitleToolsMenu
              selections={selections}
              onAction={(action) => {
                if (action === "search") {
                  createAndDispatchTask(
                    movie.title,
                    "Searching subtitle...",
                    download.mutateAsync,
                    {
                      radarrId,
                      form: {
                        language: code2,
                        forced,
                        hi,
                      },
                    }
                  );
                } else if (action === "delete" && path !== null) {
                  createAndDispatchTask(
                    movie.title,
                    "Deleting subtitle...",
                    remove.mutateAsync,
                    {
                      radarrId,
                      form: {
                        language: code2,
                        forced,
                        hi,
                        path,
                      },
                    }
                  );
                }
              }}
            >
              <Action
                disabled={path === null || path.length === 0 || disabled}
                icon={faEllipsis}
              ></Action>
            </SubtitleToolsMenu>
          );
        },
      },
    ],
    [movie, disabled]
  );

  const data: Subtitle[] = useMemo(() => {
    const missing =
      movie?.missing_subtitles.map((item) => ({
        ...item,
        path: missingText,
      })) ?? [];

    let raw_subtitles = movie?.subtitles ?? [];
    if (onlyDesired) {
      raw_subtitles = filterSubtitleBy(raw_subtitles, profileItems);
    }

    return [...raw_subtitles, ...missing];
  }, [movie, onlyDesired, profileItems]);

  return (
    <SimpleTable
      columns={columns}
      data={data}
      emptyText="No Subtitles Found For This Movie"
    ></SimpleTable>
  );
};

export default Table;
