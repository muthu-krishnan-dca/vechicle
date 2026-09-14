from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from api.models import Vehicle, Challan, Policy, RTOQuestion


class Command(BaseCommand):
    help = "Seed realistic Indian bike registrations, challans, policies, and RTO exam questions."

    def handle(self, *args, **options):
        self.stdout.write("Clearing existing data...")
        Vehicle.objects.all().delete()
        Challan.objects.all().delete()
        Policy.objects.all().delete()
        RTOQuestion.objects.all().delete()

        today = date.today()

        self.stdout.write("Seeding Vehicles & Challans...")

        # 1. Royal Enfield Hunter 350
        v1 = Vehicle.objects.create(
            registration_number="MH01AE8055",
            owner_name="ROHIT SHARMA",
            masked_owner="R***T SH***A",
            maker_model="Royal Enfield Hunter 350 Dapper Ash",
            vehicle_class="M-Cycle/Scooter(2WN)",
            fuel_type="PETROL",
            engine_capacity_cc=349,
            registration_date=today - timedelta(days=500),
            fitness_upto=today + timedelta(days=365 * 13),
            insurance_upto=today + timedelta(days=45),
            pucc_upto=today + timedelta(days=120),
            rto_office="MH-01 RTO TARDEO, MUMBAI",
            chassis_number_masked="ME3J35FD9PN890212",
            engine_number_masked="J35F02881124",
            status="ACTIVE",
        )
        Challan.objects.create(
            vehicle=v1,
            challan_number="MH-2026-08119",
            violation_title="Signal Jumping / Red Light Violation (Section 184)",
            violation_description="Motor vehicle crossed stop line and entered junction during red phase caught on automated ANPR camera.",
            offense_date=timezone.now() - timedelta(days=14, hours=3),
            offense_place="Haji Ali Traffic Junction, Mumbai",
            fine_amount=1000.00,
            status="PENDING",
        )
        Challan.objects.create(
            vehicle=v1,
            challan_number="MH-2026-02481",
            violation_title="Riding Without Helmet (Section 194D)",
            violation_description="Rider photographed without certified protective headgear.",
            offense_date=timezone.now() - timedelta(days=45),
            offense_place="Marine Drive Promenade, Mumbai",
            fine_amount=1000.00,
            status="PAID",
            paid_at=timezone.now() - timedelta(days=40),
            payment_reference="PAY-MH-2026-904128",
        )

        # 2. Yamaha MT-15 V2
        v2 = Vehicle.objects.create(
            registration_number="DL01AB1234",
            owner_name="VIKRAM MALHOTRA",
            masked_owner="V***AM M***RA",
            maker_model="Yamaha MT-15 V2 Deluxe Cyan Storm",
            vehicle_class="M-Cycle/Scooter(2WN)",
            fuel_type="PETROL",
            engine_capacity_cc=155,
            registration_date=today - timedelta(days=800),
            fitness_upto=today + timedelta(days=365 * 12),
            insurance_upto=today - timedelta(days=5),  # Expired
            pucc_upto=today - timedelta(days=15),
            rto_office="DL-01 MALL ROAD RTO, DELHI",
            chassis_number_masked="ME1RG06...4192",
            engine_number_masked="G3J4E...0041",
            status="ACTIVE",
        )
        Challan.objects.create(
            vehicle=v2,
            challan_number="DL-2026-03912",
            violation_title="Dangerous Driving & High Speed Zig-Zag (Section 184)",
            violation_description="Reckless lane changing and over-acceleration detected on highway flyover.",
            offense_date=timezone.now() - timedelta(days=8, hours=6),
            offense_place="Barapullah Elevated Corridor, New Delhi",
            fine_amount=2000.00,
            status="PENDING",
        )

        # 3. Honda Activa 6G
        v3 = Vehicle.objects.create(
            registration_number="TN09AZ4321",
            owner_name="PRIYA SUNDARAM",
            masked_owner="P***A S***AM",
            maker_model="Honda Activa 6G Premium Pearl Siren Blue",
            vehicle_class="M-Cycle/Scooter(2WN)",
            fuel_type="PETROL",
            engine_capacity_cc=109,
            registration_date=today - timedelta(days=1100),
            fitness_upto=today + timedelta(days=365 * 11),
            insurance_upto=today + timedelta(days=15),  # Expiring Soon
            pucc_upto=today + timedelta(days=60),
            rto_office="TN-09 RTO THIRUVANMIYUR, CHENNAI",
            chassis_number_masked="ME4JF50...6581",
            engine_number_masked="JF50E...9182",
            status="ACTIVE",
        )
        Challan.objects.create(
            vehicle=v3,
            challan_number="TN-2026-10492",
            violation_title="Pillion Rider Without Helmet (Section 194D)",
            violation_description="Pillion passenger observed without safety helmet on arterial public road.",
            offense_date=timezone.now() - timedelta(days=3, hours=1),
            offense_place="OMR IT Corridor, Chennai",
            fine_amount=1000.00,
            status="PENDING",
        )

        # 4. KTM 390 Duke
        v4 = Vehicle.objects.create(
            registration_number="KA05MH9999",
            owner_name="ARJUN REDDY DESHMUKH",
            masked_owner="A***N R***Y D***H",
            maker_model="KTM 390 Duke Ceramic White",
            vehicle_class="M-Cycle/Scooter(2WN)",
            fuel_type="PETROL",
            engine_capacity_cc=373,
            registration_date=today - timedelta(days=200),
            fitness_upto=today + timedelta(days=365 * 14),
            insurance_upto=today + timedelta(days=180),  # Active
            pucc_upto=today + timedelta(days=180),
            rto_office="KA-05 JAYANAGAR RTO, BENGALURU",
            chassis_number_masked="MD625...7731",
            engine_number_masked="JE37E...6621",
            status="ACTIVE",
        )
        Challan.objects.create(
            vehicle=v4,
            challan_number="KA-2026-44019",
            violation_title="Exceeding Speed Limit (>80 km/h) (Section 112/183)",
            violation_description="Speed radar recorded 94 km/h in designated 60 km/h urban arterial corridor.",
            offense_date=timezone.now() - timedelta(days=5, hours=4),
            offense_place="Bellandur Outer Ring Road, Bengaluru",
            fine_amount=2000.00,
            status="PENDING",
        )
        Challan.objects.create(
            vehicle=v4,
            challan_number="KA-2026-11840",
            violation_title="Defective Number Plate (Section 51/177)",
            violation_description="Non-standard font and styling on high-security registration plate.",
            offense_date=timezone.now() - timedelta(days=22),
            offense_place="Koramangala 80 Feet Road, Bengaluru",
            fine_amount=500.00,
            status="PENDING",
        )

        # 5. Hero Splendor Plus XTEC
        v5 = Vehicle.objects.create(
            registration_number="UP32BK7711",
            owner_name="AMIT KUMAR TIWARI",
            masked_owner="A***T K***R T***I",
            maker_model="Hero Splendor Plus XTEC Black Canvas",
            vehicle_class="M-Cycle/Scooter(2WN)",
            fuel_type="PETROL",
            engine_capacity_cc=97,
            registration_date=today - timedelta(days=1400),
            fitness_upto=today + timedelta(days=365 * 10),
            insurance_upto=today + timedelta(days=200),
            pucc_upto=today + timedelta(days=90),
            rto_office="UP-32 TRANSPORT NAGAR RTO, LUCKNOW",
            chassis_number_masked="MBLHA10...3281",
            engine_number_masked="HA10E...7719",
            status="ACTIVE",
        )
        Challan.objects.create(
            vehicle=v5,
            challan_number="UP-2026-00441",
            violation_title="Unauthorized Parking / Towing Zone (Section 122/177)",
            violation_description="Parked in designated no-stopping corridor causing traffic obstruction.",
            offense_date=timezone.now() - timedelta(days=60),
            offense_place="Hazratganj Main Market, Lucknow",
            fine_amount=500.00,
            status="PAID",
            paid_at=timezone.now() - timedelta(days=59),
        # 6. Masters India Sample Goods / Commercial Vehicle AB03Y8711
        v6 = Vehicle.objects.create(
            registration_number="AB03Y8711",
            owner_name="DEEPAK YADAV",
            masked_owner="D****K Y***V",
            maker_model="Mahindra Bolero Maxi Truck Plus",
            vehicle_class="Goods Carrier (LGV)",
            fuel_type="DIESEL",
            engine_capacity_cc=2523,
            registration_date=today - timedelta(days=900),
            fitness_upto=today + timedelta(days=365 * 3),
            insurance_upto=today + timedelta(days=120),
            pucc_upto=today + timedelta(days=160),
            rto_office="UP-79 RTO CHANDAULI / FATEHPUR, UTTAR PRADESH",
            chassis_number_masked="MA1ZN2...8711",
            engine_number_masked="M2DICR...8711",
            status="ACTIVE",
        )
        Challan.objects.create(
            vehicle=v6,
            challan_number="UK199375240702184716",
            violation_title="Violation of parking rules., Faulty number plate",
            violation_description="Violation of parking rules. (MV act 1988 S 122,126 R/W 177) | Faulty number plate (Section 192 read with Rule 51 of the CMV rules 1989) (Remark: Without cash)",
            offense_date=timezone.now() - timedelta(days=74),
            offense_place="69WR+JMW, Khamanpur, Uttar Pradesh 232110, India",
            fine_amount=11500.00,
            status="PENDING",
        )
        Challan.objects.create(
            vehicle=v6,
            challan_number="UP79158240402111906",
            violation_title="Violation of parking rules.",
            violation_description="Violation of parking rules. (MV act 1988 S 122,126 R/W 177)",
            offense_date=timezone.now() - timedelta(days=165),
            offense_place="Canal, Rania, Fatehpur Roshanai, Uttar Pradesh 209304, India",
            fine_amount=500.00,
            status="PAID",
            paid_at=timezone.now() - timedelta(days=165),
            payment_reference="UKRTE24040046069",
        )
        Challan.objects.create(
            vehicle=v6,
            challan_number="UP176341230706121541",
            violation_title="Faulty number plate",
            violation_description="Faulty number plate (Section 192 read with Rule 51 of the CMV rules 1989)",
            offense_date=timezone.now() - timedelta(days=430),
            offense_place="Fatehpur / Rania, Uttar Pradesh",
            fine_amount=5000.00,
            status="PAID",
            paid_at=timezone.now() - timedelta(days=430),
            payment_reference="UKTTE23070070305",
        )

        self.stdout.write("Seeding Initial Policies in Vault...")

        Policy.objects.create(
            policy_number="POL-DIGIT-2025-784192",
            vehicle_reg_no="MH01AE8055",
            owner_name="Rohit Sharma",
            owner_email="rohit.sharma@example.com",
            owner_phone="+91 98201 44552",
            insurer_name="Digit Insurance",
            plan_name="Comprehensive Two-Wheeler Package",
            engine_capacity_cc=349,
            idv_amount=85000.00,
            ncb_percent=20,
            od_premium=1237.60,
            tp_premium=1366.00,
            addons_total=967.50,
            selected_addons=["zero_dep", "pa_cover"],
            net_premium=3571.10,
            gst_amount=642.80,
            total_premium=4213.90,
            start_date=today - timedelta(days=320),
            end_date=today + timedelta(days=45),
        )

        Policy.objects.create(
            policy_number="POL-HDFC-2026-009412",
            vehicle_reg_no="KA05MH9999",
            owner_name="Arjun Reddy Deshmukh",
            owner_email="arjun.reddy@example.com",
            owner_phone="+91 98450 11223",
            insurer_name="HDFC ERGO General Insurance",
            plan_name="Platinum 2-Wheeler Titanium Cover",
            engine_capacity_cc=373,
            idv_amount=142000.00,
            ncb_percent=35,
            od_premium=1800.20,
            tp_premium=2804.00,
            addons_total=2340.00,
            selected_addons=["zero_dep", "pa_cover", "engine_protect", "rti"],
            net_premium=6944.20,
            gst_amount=1249.96,
            total_premium=8194.16,
            start_date=today - timedelta(days=185),
            end_date=today + timedelta(days=180),
        )

        self.stdout.write("Seeding RTO Exam Questions with Road Signs...")

        questions = [
            {
                "order": 1,
                "question_text": "What does an octagonal red road sign with 'STOP' written on it indicate?",
                "sign_code": "STOP",
                "category": "Mandatory Signs",
                "options": [
                    "Slow down and proceed with caution",
                    "Bring vehicle to complete halt and yield right of way to traffic before proceeding",
                    "Stop only if emergency vehicles are approaching",
                    "No stopping or parking allowed in this zone",
                ],
                "correct_index": 1,
                "explanation": "The STOP sign is a mandatory regulatory sign. Drivers must bring their vehicle to a complete stop behind the stop line and yield right of way.",
            },
            {
                "order": 2,
                "question_text": "An inverted triangle sign with a red border and white background signifies:",
                "sign_code": "GIVE_WAY",
                "category": "Mandatory Signs",
                "options": [
                    "Pedestrian zebra crossing ahead",
                    "Yield right of way (Give Way) to oncoming and traffic on the main road",
                    "Steep gradient downhill ahead",
                    "Narrow bridge ahead",
                ],
                "correct_index": 1,
                "explanation": "An inverted equilateral triangle is the official 'Give Way' sign. It directs drivers to slow down and yield right of way to traffic on the main road.",
            },
            {
                "order": 3,
                "question_text": "A circular sign featuring a red circle with a horizontal white bar across the middle indicates:",
                "sign_code": "NO_ENTRY",
                "category": "Mandatory Signs",
                "options": [
                    "One-way road ending",
                    "No Entry - Vehicular traffic prohibited in this direction",
                    "Toll plaza checkpoint ahead",
                    "Dead end street",
                ],
                "correct_index": 1,
                "explanation": "A solid red circle with a horizontal white bar is the universal 'No Entry' sign. Motor vehicles are strictly prohibited from entering.",
            },
            {
                "order": 4,
                "question_text": "A circular sign with a red border containing the numeral '50' indicates:",
                "sign_code": "SPEED_LIMIT_50",
                "category": "Mandatory Signs",
                "options": [
                    "Recommended minimum cruising speed is 50 km/h",
                    "Maximum permissible speed limit is 50 km/h",
                    "Next highway exit is in 50 meters",
                    "Distance to nearest city center is 50 kilometers",
                ],
                "correct_index": 1,
                "explanation": "Speed limit signs with red borders are mandatory limits under Section 112 of the Motor Vehicles Act. Exceeding 50 km/h is a punishable offense.",
            },
            {
                "order": 5,
                "question_text": "What does a triangular warning sign with a walking person symbol on parallel lines indicate?",
                "sign_code": "PEDESTRIAN_CROSSING",
                "category": "Cautionary Signs",
                "options": [
                    "Pedestrian crossing (Zebra Crossing) ahead - slow down and prepare to yield",
                    "Pedestrians are strictly prohibited from walking here",
                    "Jogging and running track nearby",
                    "Footpath under civil repair",
                ],
                "correct_index": 0,
                "explanation": "Triangular cautionary signs warn drivers of pedestrian crossings ahead, requiring drivers to slow down and give unconditional right of way to pedestrians.",
            },
            {
                "order": 6,
                "question_text": "A circular sign with a red border showing a right-turn arrow crossed by a red diagonal slash means:",
                "sign_code": "RIGHT_TURN_PROHIBITED",
                "category": "Mandatory Signs",
                "options": [
                    "Compulsory turn right ahead",
                    "Right turn strictly prohibited for all vehicles",
                    "Sharp right curve ahead",
                    "Side road to the right",
                ],
                "correct_index": 1,
                "explanation": "A directional arrow struck through with a red diagonal bar prohibits making turns in that direction.",
            },
            {
                "order": 7,
                "question_text": "A circular sign with a red border showing an inverted U-arrow with a diagonal red line indicates:",
                "sign_code": "U_TURN_PROHIBITED",
                "category": "Mandatory Signs",
                "options": [
                    "U-turn allowed only for two-wheelers",
                    "U-Turn is strictly prohibited at this intersection",
                    "Roundabout ahead in 100 meters",
                    "Curved underpass ahead",
                ],
                "correct_index": 1,
                "explanation": "U-turn prohibited sign bans taking a complete reversal turn at the intersection or roadway median.",
            },
            {
                "order": 8,
                "question_text": "A circular sign with a red border displaying two cars alongside each other with a red slash indicates:",
                "sign_code": "OVERTAKING_PROHIBITED",
                "category": "Mandatory Signs",
                "options": [
                    "Car pooling zone",
                    "Overtaking is strictly prohibited on this section of road",
                    "Two-lane road converging into single lane",
                    "Vehicle parking on both sides",
                ],
                "correct_index": 1,
                "explanation": "Overtaking prohibited sign forbids drivers from overtaking any moving vehicle due to blind corners, narrow roads, or bridges.",
            },
            {
                "order": 9,
                "question_text": "A circular sign with a vehicle horn graphic crossed out with a red diagonal line means:",
                "sign_code": "HORN_PROHIBITED",
                "category": "Mandatory Signs",
                "options": [
                    "Horn test mandatory before proceeding",
                    "Sounding of vehicle horn is strictly prohibited (Silence Zone)",
                    "Defective horn repair workshop ahead",
                    "High noise pollution warning",
                ],
                "correct_index": 1,
                "explanation": "Silence zones are typically near hospitals, courts, and educational institutions where sounding horns is strictly prohibited.",
            },
            {
                "order": 10,
                "question_text": "A triangular cautionary sign showing two parallel lines that narrow inwards indicates:",
                "sign_code": "NARROW_ROAD_AHEAD",
                "category": "Cautionary Signs",
                "options": [
                    "Road ahead narrows significantly",
                    "Divided carriageway beginning",
                    "Single lane flyover ahead",
                    "Railway track crossing without gates",
                ],
                "correct_index": 0,
                "explanation": "This cautionary warning indicates that the road width reduces ahead, prompting drivers to slow down and avoid overtaking.",
            },
            {
                "order": 11,
                "question_text": "Under the Motor Vehicles Act, what is the valid legal validity period of a Learner's Licence (LL)?",
                "sign_code": "TRAFFIC_RULE",
                "category": "Traffic Rules",
                "options": [
                    "3 months from date of issue",
                    "6 months from date of issue",
                    "1 year from date of issue",
                    "Valid until age 30",
                ],
                "correct_index": 1,
                "explanation": "An Indian RTO Learner's Licence (LL) is valid for 6 months across India. A permanent licence test can be taken after 30 days of holding an LL.",
            },
            {
                "order": 12,
                "question_text": "What is the compulsory minimum Third Party (TP) property damage liability cover mandated by IRDAI for two-wheelers?",
                "sign_code": "TRAFFIC_RULE",
                "category": "Insurance & Legal",
                "options": [
                    "₹50,000",
                    "₹1,00,000 (Optional ₹6,000 limit)",
                    "₹15,00,000",
                    "Unlimited property damage",
                ],
                "correct_index": 1,
                "explanation": "Under IRDAI regulations, standard Two-Wheeler Third Party motor insurance includes ₹1 Lakh third party property damage cover (which can be opted down to ₹6,000).",
            },
            {
                "order": 13,
                "question_text": "When approaching an uncontrolled road intersection with no traffic lights or police, right of way belongs to:",
                "sign_code": "TRAFFIC_RULE",
                "category": "Traffic Rules",
                "options": [
                    "The vehicle approaching from the left",
                    "The vehicle approaching from the right side",
                    "The larger vehicle or heavy transport vehicle",
                    "The vehicle that blows horn the loudest",
                ],
                "correct_index": 1,
                "explanation": "In Indian road regulations, drivers must give way to traffic approaching from their right at uncontrolled intersections.",
            },
            {
                "order": 14,
                "question_text": "What is the legal blood alcohol concentration (BAC) limit permissible for motor vehicle drivers in India?",
                "sign_code": "TRAFFIC_RULE",
                "category": "Traffic Rules",
                "options": [
                    "50 mg per 100 ml of blood",
                    "30 mg per 100 ml of blood",
                    "80 mg per 100 ml of blood",
                    "10 mg per 100 ml of blood",
                ],
                "correct_index": 1,
                "explanation": "Under Section 185 of the Motor Vehicles Act, the legal threshold for drunken driving is exceeding 30 mg of alcohol per 100 ml of blood detected by breathalyzer.",
            },
            {
                "order": 15,
                "question_text": "A rectangular blue sign with a white bed and a red cross symbol indicates:",
                "sign_code": "HOSPITAL_AHEAD",
                "category": "Informatory Signs",
                "options": [
                    "Rest house / hotel nearby",
                    "Hospital facility ahead",
                    "First aid post only",
                    "Emergency ambulance parking only",
                ],
                "correct_index": 1,
                "explanation": "A bed symbol alongside a red cross on a blue rectangular informatory sign indicates a hospital with inpatient medical facilities ahead.",
            },
        ]

        for q in questions:
            RTOQuestion.objects.create(
                question_text=q["question_text"],
                sign_code=q["sign_code"],
                category=q["category"],
                options=q["options"],
                correct_index=q["correct_index"],
                explanation=q["explanation"],
                order=q["order"],
            )

        self.stdout.write(self.style.SUCCESS("Database successfully seeded with realistic Indian vehicles, challans, policies, and 15 RTO exam questions!"))
