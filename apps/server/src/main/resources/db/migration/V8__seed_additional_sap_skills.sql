INSERT INTO sap_skills (code, name, skill_type)
VALUES
    ('PP', 'SAP PP', 'MODULE'),
    ('QM', 'SAP QM', 'MODULE'),
    ('PM', 'SAP PM', 'MODULE'),
    ('HCM', 'SAP HCM', 'MODULE'),
    ('EWM', 'SAP EWM', 'MODULE'),
    ('WM', 'SAP WM', 'MODULE'),
    ('BW', 'SAP BW', 'MODULE'),
    ('ARIBA', 'SAP Ariba', 'SOLUTION'),
    ('CONCUR', 'SAP Concur', 'SOLUTION'),
    ('BTP', 'SAP BTP', 'SOLUTION'),
    ('ANALYTICS_CLOUD', 'SAP Analytics Cloud', 'SOLUTION'),
    ('FIORI', 'SAP Fiori', 'TECHNICAL'),
    ('UI5', 'SAP UI5', 'TECHNICAL'),
    ('ODATA', 'OData', 'TECHNICAL'),
    ('CDS_VIEW', 'CDS View', 'TECHNICAL'),
    ('PI_PO', 'SAP PI/PO', 'TECHNICAL'),
    ('CPI', 'SAP CPI', 'TECHNICAL'),
    ('BW4HANA', 'SAP BW/4HANA', 'TECHNICAL')
ON CONFLICT (code) DO NOTHING;
