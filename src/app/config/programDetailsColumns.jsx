import { Link } from 'react-router-dom';
import programData from '../../data/Program_Details.json';

export const columns = [
  {
    key: "program",
    label: "Program",
    sortable: true,
    render: (row) => (
      <Link to={`/programs/${row.program}`} className="text-blue-600 hover:underline">
        {row.program}
      </Link>
    ),
  },
  ...programData.columns.filter((col) => col.key !== "program"),
];
