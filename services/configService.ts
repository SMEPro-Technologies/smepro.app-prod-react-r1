import { SubscriptionPlan } from '../types';

// To guarantee that the configuration schemas are always available and to prevent 404 errors
// in deployed environments, the JSON content is embedded directly into the application.
// This is the most robust solution as it removes any dependency on `fetch` or server file paths.

const soloSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SMEPro Solo Signup Categories",
  "description": "Production-ready schema for SMEPro Solo signup criteria, including categories, sub-categories, and a static list of objectives.",
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": [
        "Entertainment & Creative Arts",
        "Professional Services",
        "Entrepreneurship & Startups",
        "Education & Knowledge Work",
        "Lifestyle & Independent Professions"
      ]
    },
    "subCategory": { "type": "string" },
    "objective": { "type": "string" }
  },
  "required": ["category", "subCategory", "objective"],
  "allOf": [
    {
      "if": { "properties": { "category": { "const": "Entertainment & Creative Arts" } } },
      "then": { "properties": { "subCategory": { "enum": ["Music", "Visual Arts", "Film & Video", "Performing Arts", "Fashion & Design", "Writing & Publishing"] } } }
    },
    {
      "if": { "properties": { "category": { "const": "Professional Services" } } },
      "then": { "properties": { "subCategory": { "enum": ["Management Consulting", "Freelance Tech & Development", "Legal & Compliance Services", "Financial Advisory"] } } }
    },
    {
      "if": { "properties": { "category": { "const": "Entrepreneurship & Startups" } } },
      "then": { "properties": { "subCategory": { "enum": ["Startup Founder", "E-commerce Entrepreneur", "Social Enterprise", "Innovation & Tech Commercialization"] } } }
    },
    {
      "if": { "properties": { "category": { "const": "Education & Knowledge Work" } } },
      "then": { "properties": { "subCategory": { "enum": ["Tutoring & Coaching", "Digital Content Creation", "Independent Research & Writing"] } } }
    },
    {
      "if": { "properties": { "category": { "const": "Lifestyle & Independent Professions" } } },
      "then": { "properties": { "subCategory": { "enum": ["Health & Wellness Coaching", "Culinary Arts", "Artisan Crafts & Trades", "Professional Photography"] } } }
    },
    { "if": { "properties": { "subCategory": { "const": "Music" } } }, "then": { "properties": { "objective": { "enum": ["Produce Album", "Build Audience", "Monetize Skills", "Book Gigs"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Visual Arts" } } }, "then": { "properties": { "objective": { "enum": ["Launch Portfolio", "Sell Artwork", "Build Audience", "Secure Commissions"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Film & Video" } } }, "then": { "properties": { "objective": { "enum": ["Produce Short Film", "Build YouTube Channel", "Monetize Content", "Freelance Videography"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Performing Arts" } } }, "then": { "properties": { "objective": { "enum": ["Secure Auditions", "Produce a Show", "Build Audience", "Teach a Workshop"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Fashion & Design" } } }, "then": { "properties": { "objective": { "enum": ["Launch Clothing Line", "Build Portfolio", "Freelance Design Work", "Open E-commerce Store"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Writing & Publishing" } } }, "then": { "properties": { "objective": { "enum": ["Publish a Book", "Build Blog Audience", "Freelance Writing Gigs", "Start a Newsletter"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Management Consulting" } } }, "then": { "properties": { "objective": { "enum": ["Acquire Clients", "Develop Frameworks", "Build Personal Brand", "Specialize in a Niche"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Freelance Tech & Development" } } }, "then": { "properties": { "objective": { "enum": ["Find Freelance Projects", "Build a SaaS Product", "Contribute to Open Source", "Automate Workflows"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Legal & Compliance Services" } } }, "then": { "properties": { "objective": { "enum": ["Start Solo Practice", "Offer Niche Services", "Automate Document Review", "Client Acquisition"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Financial Advisory" } } }, "then": { "properties": { "objective": { "enum": ["Build Client Base", "Develop Financial Models", "Offer Specialized Advice", "Automate Reporting"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Startup Founder" } } }, "then": { "properties": { "objective": { "enum": ["Secure Funding", "Build MVP", "Achieve Product-Market Fit", "Scale Operations"] } } } },
    { "if": { "properties": { "subCategory": { "const": "E-commerce Entrepreneur" } } }, "then": { "properties": { "objective": { "enum": ["Launch Online Store", "Optimize Supply Chain", "Market Products", "Increase Conversion Rate"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Social Enterprise" } } }, "then": { "properties": { "objective": { "enum": ["Define Social Impact", "Secure Grants/Funding", "Measure Outcomes", "Build Community"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Innovation & Tech Commercialization" } } }, "then": { "properties": { "objective": { "enum": ["Patent Technology", "Find Market Application", "Create Business Plan", "License Technology"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Tutoring & Coaching" } } }, "then": { "properties": { "objective": { "enum": ["Acquire Students/Clients", "Develop Curriculum", "Build Online Platform", "Market Services"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Digital Content Creation" } } }, "then": { "properties": { "objective": { "enum": ["Build Audience", "Monetize Content", "Create Online Course", "Launch Podcast/YouTube"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Independent Research & Writing" } } }, "then": { "properties": { "objective": { "enum": ["Publish Research Paper", "Write a Book", "Secure Grants", "Consulting"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Health & Wellness Coaching" } } }, "then": { "properties": { "objective": { "enum": ["Build Client Base", "Develop Coaching Programs", "Market Services", "Host Workshops"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Culinary Arts" } } }, "then": { "properties": { "objective": { "enum": ["Start Catering Business", "Personal Chef Services", "Launch Food Product", "Create Food Blog"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Artisan Crafts & Trades" } } }, "then": { "properties": { "objective": { "enum": ["Sell on Etsy/Marketplaces", "Teach Workshops", "Streamline Production", "Wholesale Orders"] } } } },
    { "if": { "properties": { "subCategory": { "const": "Professional Photography" } } }, "then": { "properties": { "objective": { "enum": ["Build Portfolio", "Book Clients (Weddings, Portraits)", "Sell Stock Photos", "Specialize in a Niche"] } } } }
  ]
};

const businessSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SMEPro Business Signup Categories",
  "description": "Production-ready schema for SMEPro Business signup criteria, including top 30 industries, sub-types, and a static list for operating segments.",
  "type": "object",
  "properties": {
    "industry": {
      "type": "string",
      "enum": [
        "Technology",
        "Healthcare & Pharmaceuticals",
        "Financial Services",
        "Oil & Gas Exploration & Production",
        "Automotive Manufacturing & Sales",
        "Retail & E-commerce",
        "Real Estate & Construction",
        "Telecommunications",
        "Transportation & Logistics",
        "Energy & Utilities",
        "Agriculture & Agribusiness",
        "Food & Beverage Manufacturing",
        "Media & Entertainment",
        "Education & Training",
        "Aerospace & Defense",
        "Chemicals & Materials",
        "Hospitality & Tourism",
        "Mining & Metals",
        "Consumer Goods",
        "Biotechnology & Life Sciences",
        "Environmental Services",
        "Professional Services",
        "Government & Public Administration",
        "Nonprofit & NGOs",
        "Sports & Recreation",
        "Shipping & Maritime",
        "Electronics & Semiconductors",
        "Cloud Computing & AI Services",
        "Cybersecurity",
        "Logistics & Supply Chain Management"
      ]
    },
    "subType": { "type": "string" },
    "operatingSegment": { "type": "string" }
  },
  "required": ["industry", "subType", "operatingSegment"],
  "allOf": [
    { "if": { "properties": { "industry": { "const": "Technology" } } }, "then": { "properties": { "subType": { "enum": ["Software Development","Cloud Services","AI/ML","Cybersecurity","Hardware","Semiconductors","IT Consulting","SaaS","Gaming","Data Analytics"] } } } },
    { "if": { "properties": { "industry": { "const": "Healthcare & Pharmaceuticals" } } }, "then": { "properties": { "subType": { "enum": ["Hospitals","Clinics","Pharmaceuticals","Biotechnology","Medical Devices","Telemedicine","Health Insurance","Research Labs","Public Health","Wellness"] } } } },
    { "if": { "properties": { "industry": { "const": "Financial Services" } } }, "then": { "properties": { "subType": { "enum": ["Banking","Insurance","Pension Funds","Investment Banking","Wealth Management","FinTech","Credit Unions","Payment Processing","Risk Management","Accounting Services"] } } } },
    { "if": { "properties": { "industry": { "const": "Oil & Gas Exploration & Production" } } }, "then": { "properties": { "subType": { "enum": ["Upstream Exploration","Midstream Transport","Downstream Refining","Natural Gas","Petrochemicals","Oilfield Services","Drilling","Pipeline Operations","Energy Trading","Renewable Integration"] } } } },
    { "if": { "properties": { "industry": { "const": "Automotive Manufacturing & Sales" } } }, "then": { "properties": { "subType": { "enum": ["OEM Manufacturing","Electric Vehicles","Parts & Components","Dealerships","Fleet Services","Aftermarket","Autonomous Vehicles","Logistics","Car Rentals","Motorsports"] } } } },
    { "if": { "properties": { "industry": { "const": "Retail & E-commerce" } } }, "then": { "properties": { "subType": { "enum": ["Brick & Mortar","Online Retail","Wholesale","Luxury Goods","Fast Fashion","Consumer Electronics","Home Goods","Marketplace Platforms","Subscription Commerce","Omnichannel Retail"] } } } },
    { "if": { "properties": { "industry": { "const": "Real Estate & Construction" } } }, "then": { "properties": { "subType": { "enum": ["Residential Development","Commercial Development","Industrial Construction","Property Management","Real Estate Investment","Architecture","Urban Planning","Green Building","Infrastructure Projects","Facilities Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Telecommunications" } } }, "then": { "properties": { "subType": { "enum": ["Mobile Networks","Fixed-Line Services","Broadband","Satellite Communications","VoIP","Telecom Equipment","5G Services","IoT Connectivity","Data Centers","Network Security"] } } } },
    { "if": { "properties": { "industry": { "const": "Transportation & Logistics" } } }, "then": { "properties": { "subType": { "enum": ["Airlines","Rail","Trucking","Shipping","Warehousing","Freight Forwarding","Public Transit","Supply Chain Management","Courier Services","Last-Mile Delivery"] } } } },
    { "if": { "properties": { "industry": { "const": "Energy & Utilities" } } }, "then": { "properties": { "subType": { "enum": ["Electric Power","Renewables","Nuclear","Hydropower","Grid Management","Energy Storage","Smart Grids","Utility Services","Energy Trading","Waste-to-Energy"] } } } },
    { "if": { "properties": { "industry": { "const": "Agriculture & Agribusiness" } } }, "then": { "properties": { "subType": { "enum": ["Crop Production","Livestock","AgriTech","Farming Equipment","Dairy","Fisheries","Organic Farming","Agri Logistics","Food Processing","Agri Research"] } } } },
    { "if": { "properties": { "industry": { "const": "Food & Beverage Manufacturing" } } }, "then": { "properties": { "subType": { "enum": ["Packaged Foods","Beverages","Alcoholic Drinks","Snacks","Frozen Foods","Restaurants","Catering","Food Tech","Nutritional Products","Supply Chain"] } } } },
    { "if": { "properties": { "industry": { "const": "Media & Entertainment" } } }, "then": { "properties": { "subType": { "enum": ["Film","Television","Music","Publishing","Gaming","Streaming","Advertising","Events","Sports Media","Digital Content"] } } } },
    { "if": { "properties": { "industry": { "const": "Education & Training" } } }, "then": { "properties": { "subType": { "enum": ["Primary Education","Secondary Education","Higher Education","Vocational Training","Online Learning","Tutoring","Corporate Training","EdTech","Research Institutes","Libraries"] } } } },
    { "if": { "properties": { "industry": { "const": "Aerospace & Defense" } } }, "then": { "properties": { "subType": { "enum": ["Aircraft Manufacturing","Defense Contractors","Space Exploration","Military Technology","Avionics","Maintenance","Logistics","Cyber Defense","Satellites","R&D"] } } } },
    { "if": { "properties": { "industry": { "const": "Chemicals & Materials" } } }, "then": { "properties": { "subType": { "enum": ["Petrochemicals","Plastics","Industrial Chemicals","Specialty Chemicals","Construction Materials","Metals","Composites","Nanomaterials","Recycling","Packaging Materials"] } } } },
    { "if": { "properties": { "industry": { "const": "Hospitality & Tourism" } } }, "then": { "properties": { "subType": { "enum": ["Hotels","Resorts","Travel Agencies","Cruise Lines","Airbnb","Event Management","Theme Parks","Tour Operators","Restaurants","Eco Tourism"] } } } },
    { "if": { "properties": { "industry": { "const": "Mining & Metals" } } }, "then": { "properties": { "subType": { "enum": ["Iron Ore","Coal","Gold","Copper","Rare Earths","Steel","Aluminum","Mining Equipment","Exploration","Sustainability"] } } } },
    { "if": { "properties": { "industry": { "const": "Consumer Goods" } } }, "then": { "properties": { "subType": { "enum": ["Apparel","Household Products","Personal Care","Electronics","Furniture","Toys","Luxury Goods","Sports Equipment","DIY Products","Packaging"] } } } },
    { "if": { "properties": { "industry": { "const": "Biotechnology & Life Sciences" } } }, "then": { "properties": { "subType": { "enum": ["Genomics", "Drug Discovery", "Bioinformatics", "Clinical Trials", "Medical Devices", "Cell & Gene Therapy", "Agricultural Biotech", "Industrial Biotech", "Biodefense", "Regulatory Affairs"] } } } },
    { "if": { "properties": { "industry": { "const": "Environmental Services" } } }, "then": { "properties": { "subType": { "enum": ["Waste Management", "Recycling", "Water Treatment", "Air Quality", "Environmental Consulting", "Renewable Energy Services", "Land Remediation", "Carbon Management", "Sustainability Reporting", "Conservation"] } } } },
    { "if": { "properties": { "industry": { "const": "Professional Services" } } }, "then": { "properties": { "subType": { "enum": ["Legal Services", "Accounting", "Management Consulting", "Marketing & Advertising", "Architectural Services", "Engineering Services", "HR Consulting", "IT Services", "Research Services", "Public Relations"] } } } },
    { "if": { "properties": { "industry": { "const": "Government & Public Administration" } } }, "then": { "properties": { "subType": { "enum": ["Federal Government", "State Government", "Local Government", "Public Safety", "Defense", "Social Services", "Urban Planning", "Public Transport", "International Relations", "Regulatory Agencies"] } } } },
    { "if": { "properties": { "industry": { "const": "Nonprofit & NGOs" } } }, "then": { "properties": { "subType": { "enum": ["Humanitarian Aid", "Environmental", "Healthcare", "Education", "Arts & Culture", "Animal Welfare", "Social Advocacy", "Community Development", "Foundations", "International Development"] } } } },
    { "if": { "properties": { "industry": { "const": "Sports & Recreation" } } }, "then": { "properties": { "subType": { "enum": ["Professional Sports", "Fitness Centers", "Sporting Goods", "Outdoor Recreation", "Esports", "Event Management", "Sports Marketing", "Amateur Sports", "Betting & Gaming", "Stadium Operations"] } } } },
    { "if": { "properties": { "industry": { "const": "Shipping & Maritime" } } }, "then": { "properties": { "subType": { "enum": ["Container Shipping", "Bulk Carriers", "Tankers", "Port Operations", "Maritime Law", "Shipbuilding", "Cruise Lines", "Logistics", "Maritime Security", "Offshore Services"] } } } },
    { "if": { "properties": { "industry": { "const": "Electronics & Semiconductors" } } }, "then": { "properties": { "subType": { "enum": ["Semiconductor Manufacturing", "Consumer Electronics", "Industrial Electronics", "Electronic Components", "Embedded Systems", "Robotics", "Telecommunications Equipment", "Printed Circuit Boards (PCBs)", "Optoelectronics", "Sensors"] } } } },
    { "if": { "properties": { "industry": { "const": "Cloud Computing & AI Services" } } }, "then": { "properties": { "subType": { "enum": ["IaaS", "PaaS", "SaaS", "AI Development", "Machine Learning Platforms", "Data Analytics", "Cloud Storage", "DevOps", "Cybersecurity", "Cloud Consulting"] } } } },
    { "if": { "properties": { "industry": { "const": "Cybersecurity" } } }, "then": { "properties": { "subType": { "enum": ["Network Security", "Endpoint Security", "Cloud Security", "Application Security", "Identity & Access Management", "Threat Intelligence", "Security Consulting", "Managed Security Services (MSSP)", "Data Loss Prevention (DLP)", "Compliance"] } } } },
    { "if": { "properties": { "industry": { "const": "Logistics & Supply Chain Management" } } }, "then": { "properties": { "subType": { "enum": ["Warehousing", "Transportation Management", "Inventory Management", "Procurement", "Freight Forwarding", "Last-Mile Delivery", "Reverse Logistics", "Supply Chain Consulting", "Logistics Technology", "Cold Chain"] } } } },
    
    { "if": { "properties": { "subType": { "const": "Software Development" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Information Technology", "R&D", "Sales & Marketing", "Executive Management", "Human Resources"] } } } },
    { "if": { "properties": { "subType": { "const": "Cloud Services" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Information Technology", "Sales & Marketing", "Executive Management", "Logistics", "Legal & Compliance", "Accounting & Finance"] } } } },
    { "if": { "properties": { "subType": { "const": "AI/ML" } } }, "then": { "properties": { "operatingSegment": { "enum": ["R&D", "Engineering & Design", "Information Technology", "Sales & Marketing", "Executive Management", "Legal & Compliance"] } } } },
    { "if": { "properties": { "subType": { "const": "Cybersecurity" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Information Technology", "R&D", "Sales & Marketing", "Executive Management", "Legal & Compliance"] } } } },
    { "if": { "properties": { "subType": { "const": "Hardware" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "R&D", "Logistics", "Sales & Marketing", "Executive Management", "Accounting & Finance"] } } } },
    { "if": { "properties": { "subType": { "const": "Semiconductors" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "R&D", "Logistics", "Sales & Marketing", "Executive Management", "Accounting & Finance"] } } } },
    { "if": { "properties": { "subType": { "const": "IT Consulting" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Information Technology", "Sales & Marketing", "Executive Management", "Human Resources", "Accounting & Finance", "Legal & Compliance"] } } } },
    { "if": { "properties": { "subType": { "const": "SaaS" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Sales & Marketing", "Engineering & Design", "Information Technology", "Executive Management", "Human Resources", "Accounting & Finance"] } } } },
    { "if": { "properties": { "subType": { "const": "Gaming" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "R&D", "Sales & Marketing", "Executive Management", "Legal & Compliance", "Human Resources"] } } } },
    { "if": { "properties": { "subType": { "const": "Data Analytics" } } }, "then": { "properties": { "operatingSegment": { "enum": ["R&D", "Engineering & Design", "Information Technology", "Sales & Marketing", "Executive Management", "Legal & Compliance"] } } } },
    
    { "if": { "properties": { "subType": { "const": "Hospitals" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Administrative", "Human Resources", "Information Technology", "Legal & Compliance", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Clinics" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Administrative", "Human Resources", "Information Technology", "Legal & Compliance", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Pharmaceuticals" } } }, "then": { "properties": { "operatingSegment": { "enum": ["R&D", "Sales & Marketing", "Legal & Compliance", "Logistics", "Executive Management", "Accounting & Finance"] } } } },
    { "if": { "properties": { "subType": { "const": "Biotechnology" } } }, "then": { "properties": { "operatingSegment": { "enum": ["R&D", "Engineering & Design", "Legal & Compliance", "Executive Management", "Accounting & Finance"] } } } },
    { "if": { "properties": { "subType": { "const": "Medical Devices" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "R&D", "Sales & Marketing", "Legal & Compliance", "Logistics", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Telemedicine" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Information Technology", "Administrative", "Legal & Compliance", "Sales & Marketing", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Health Insurance" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Accounting & Finance", "Legal & Compliance", "Sales & Marketing", "Information Technology", "Executive Management", "Administrative"] } } } },
    { "if": { "properties": { "subType": { "const": "Research Labs" } } }, "then": { "properties": { "operatingSegment": { "enum": ["R&D", "Administrative", "Legal & Compliance", "Accounting & Finance"] } } } },
    { "if": { "properties": { "subType": { "const": "Public Health" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Administrative", "R&D", "Legal & Compliance", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Wellness" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Sales & Marketing", "Administrative", "Human Resources", "Executive Management"] } } } },
    
    { "if": { "properties": { "subType": { "const": "Banking" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Accounting & Finance", "Legal & Compliance", "Information Technology", "Sales & Marketing", "Executive Management", "Human Resources"] } } } },
    { "if": { "properties": { "subType": { "const": "Insurance" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Accounting & Finance", "Sales & Marketing", "Legal & Compliance", "Information Technology", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Pension Funds" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Accounting & Finance", "Legal & Compliance", "Executive Management", "Administrative"] } } } },
    { "if": { "properties": { "subType": { "const": "Investment Banking" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Accounting & Finance", "Legal & Compliance", "Information Technology", "Sales & Marketing", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Wealth Management" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Accounting & Finance", "Sales & Marketing", "Legal & Compliance", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "FinTech" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Information Technology", "Sales & Marketing", "Legal & Compliance", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Credit Unions" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Accounting & Finance", "Information Technology", "Sales & Marketing", "Human Resources", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Payment Processing" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Information Technology", "Engineering & Design", "Sales & Marketing", "Legal & Compliance", "Accounting & Finance"] } } } },
    { "if": { "properties": { "subType": { "const": "Risk Management" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Accounting & Finance", "Legal & Compliance", "Information Technology", "Executive Management"] } } } },
    { "if": { "properties": { "subType": { "const": "Accounting Services" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Accounting & Finance", "Legal & Compliance", "Sales & Marketing", "Executive Management"] } } } },

    { "if": { "properties": { "subType": { "const": "Brick & Mortar" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Sales & Marketing", "Logistics", "Human Resources", "Accounting & Finance", "Executive Management", "Administrative"] } } } },
    { "if": { "properties": { "subType": { "const": "Online Retail" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Sales & Marketing", "Logistics", "Information Technology", "Human Resources", "Accounting & Finance", "Executive Management"] } } } },

    { "if": { "properties": { "industry": { "const": "Oil & Gas Exploration & Production" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Logistics", "R&D", "Legal & Compliance", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Automotive Manufacturing & Sales" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Logistics", "Sales & Marketing", "R&D", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Real Estate & Construction" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Sales & Marketing", "Legal & Compliance", "Accounting & Finance", "Executive Management", "Administrative"] } } } },
    { "if": { "properties": { "industry": { "const": "Telecommunications" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Information Technology", "Sales & Marketing", "Legal & Compliance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Transportation & Logistics" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Logistics", "Information Technology", "Sales & Marketing", "Accounting & Finance", "Human Resources", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Energy & Utilities" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Logistics", "Legal & Compliance", "R&D", "Executive Management", "Accounting & Finance"] } } } },
    { "if": { "properties": { "industry": { "const": "Agriculture & Agribusiness" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Logistics", "R&D", "Sales & Marketing", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Food & Beverage Manufacturing" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Logistics", "R&D", "Sales & Marketing", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Media & Entertainment" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Sales & Marketing", "R&D", "Legal & Compliance", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Education & Training" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Administrative", "Human Resources", "Sales & Marketing", "Executive Management", "Information Technology"] } } } },
    { "if": { "properties": { "industry": { "const": "Aerospace & Defense" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "R&D", "Logistics", "Legal & Compliance", "Executive Management", "Information Technology"] } } } },
    { "if": { "properties": { "industry": { "const": "Chemicals & Materials" } } }, "then": { "properties": { "operatingSegment": { "enum": ["R&D", "Engineering & Design", "Logistics", "Sales & Marketing", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Hospitality & Tourism" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Administrative", "Sales & Marketing", "Human Resources", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Mining & Metals" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Logistics", "R&D", "Legal & Compliance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Consumer Goods" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Sales & Marketing", "Logistics", "R&D", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Biotechnology & Life Sciences" } } }, "then": { "properties": { "operatingSegment": { "enum": ["R&D", "Legal & Compliance", "Engineering & Design", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Environmental Services" } } }, "then": { "properties": { "operatingSegment": { "enum": ["R&D", "Legal & Compliance", "Engineering & Design", "Sales & Marketing", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Professional Services" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Sales & Marketing", "Human Resources", "Accounting & Finance", "Legal & Compliance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Government & Public Administration" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Administrative", "Legal & Compliance", "Information Technology", "Accounting & Finance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Nonprofit & NGOs" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Administrative", "Human Resources", "Accounting & Finance", "Executive Management", "Sales & Marketing"] } } } },
    { "if": { "properties": { "industry": { "const": "Sports & Recreation" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Sales & Marketing", "Administrative", "Legal & Compliance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Shipping & Maritime" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Logistics", "Legal & Compliance", "Engineering & Design", "Sales & Marketing", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Electronics & Semiconductors" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "R&D", "Logistics", "Sales & Marketing", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Cloud Computing & AI Services" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Engineering & Design", "Information Technology", "R&D", "Sales & Marketing", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Cybersecurity" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Information Technology", "Engineering & Design", "R&D", "Sales & Marketing", "Legal & Compliance", "Executive Management"] } } } },
    { "if": { "properties": { "industry": { "const": "Logistics & Supply Chain Management" } } }, "then": { "properties": { "operatingSegment": { "enum": ["Logistics", "Information Technology", "Sales & Marketing", "Accounting & Finance", "Executive Management"] } } } }
  ]
};

const vaultSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SMEPro Vault Categories",
  "description": "Defines the user-configurable categories for organizing saved knowledge in the SMEPro Vault.",
  "type": "object",
  "properties": {
    "categories": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "Strategic Plans",
          "Research & Data",
          "Creative Ideas",
          "Key Contacts",
          "Procedural Guides",
          "Meeting Notes",
          "Uncategorized"
        ]
      }
    }
  }
};


const smeConfigCache: { [key: string]: any } = {
  'solo_categories.json': soloSchema,
  'business_categories.json': businessSchema,
};

const vaultCategoriesCache: string[] | null = (vaultSchema as any).properties.categories.items.enum;

export const configService = {
  fetchSmeConfigSchema: async (plan: SubscriptionPlan): Promise<any> => {
    const fileName = plan.startsWith('solo') ? 'solo_categories.json' : 'business_categories.json';
    // Data is now available synchronously. We return a promise to maintain the function's async signature
    // and avoid having to refactor the components that call it.
    return Promise.resolve(smeConfigCache[fileName]);
  },

  fetchVaultCategories: async (): Promise<string[]> => {
    if (vaultCategoriesCache) {
      return Promise.resolve(vaultCategoriesCache);
    }
    // This fallback should ideally never be reached with the direct import approach.
    console.error("Vault categories could not be loaded from direct import.");
    return Promise.resolve(['General', 'Strategy', 'Action Items']); 
  },
};
