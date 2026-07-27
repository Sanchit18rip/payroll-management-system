import {
  Search,
  Plus,
  FileText
} from "lucide-react";

import Button from "./Button";

import "./DashboardHeader.css";

export default function DashboardHeader({

  greeting,

  date,

  onTerms

}) {

  return (

    <div className="dashboard-header">

      <div>

        <h1>

          {greeting} 👋

        </h1>

        <p>

          Payroll Overview

        </p>

        <span>

          {date}

        </span>

      </div>

      <div className="header-right">

        <div className="search-box">

          <Search size={18}/>

          <input

            placeholder="Search employees..."

          />

        </div>

        <Button variant="secondary">

          <FileText size={18}/>

          Terms

        </Button>

        <Button>

          <Plus size={18}/>

          Employee

        </Button>

      </div>

    </div>

  );

}