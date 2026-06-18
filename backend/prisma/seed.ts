import bcrypt from "bcryptjs";
import {
  BlockReason,
  InventoryStatus,
  LocationStatus,
  LocationType,
  MovementType,
  PrismaClient,
  Role,
  ZoneType
} from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { name: "Administrador Demo", email: "admin@demo.com", password: "Admin123456", role: Role.ADMIN },
  { name: "Supervisor Demo", email: "supervisor@demo.com", password: "Supervisor123", role: Role.SUPERVISOR },
  { name: "Operario Demo", email: "operario@demo.com", password: "Operario123", role: Role.OPERARIO },
  { name: "Auditor Demo", email: "auditor@demo.com", password: "Auditor123", role: Role.AUDITOR }
];

async function upsertUsers() {
  const result: Record<string, string> = {};

  for (const user of users) {
    const password = await bcrypt.hash(user.password, 10);
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password,
        role: user.role,
        active: true
      },
      create: {
        name: user.name,
        email: user.email,
        password,
        role: user.role,
        active: true
      }
    });
    result[user.email] = record.id;
  }

  return result;
}

async function upsertWarehouse() {
  return prisma.warehouse.upsert({
    where: { code: "60000" },
    update: {
      name: "Centro de Distribucion Lima Norte",
      country: "Peru",
      city: "Lima",
      active: true
    },
    create: {
      code: "60000",
      name: "Centro de Distribucion Lima Norte",
      country: "Peru",
      city: "Lima",
      active: true
    }
  });
}

async function upsertZones(warehouseId: string) {
  const zones = [
    { code: "A", name: "Rack A - Alta rotacion", type: ZoneType.RACK },
    { code: "B", name: "Rack B - Reserva", type: ZoneType.RACK },
    { code: "PAV", name: "Zona PAV", type: ZoneType.PAV },
    { code: "NPI", name: "Zona NPI", type: ZoneType.NPI },
    { code: "QAR", name: "Cuarentena", type: ZoneType.CUARENTENA },
    { code: "DAN", name: "Danados Piso", type: ZoneType.DANADO },
    { code: "VAL", name: "Validacion", type: ZoneType.VALIDACION },
    { code: "PICK", name: "Picking Liviano", type: ZoneType.PICKING }
  ];

  const result: Record<string, string> = {};

  for (const zone of zones) {
    const record = await prisma.zone.upsert({
      where: {
        warehouseId_code: {
          warehouseId,
          code: zone.code
        }
      },
      update: {
        name: zone.name,
        type: zone.type,
        active: true
      },
      create: {
        warehouseId,
        code: zone.code,
        name: zone.name,
        type: zone.type,
        active: true
      }
    });
    result[zone.code] = record.id;
  }

  return result;
}

async function upsertLocations(warehouseId: string, zoneIds: Record<string, string>) {
  const locations = [
    {
      locationCode: "60000-A-P01-R01-N01-U01",
      zoneCode: "A",
      aisle: "P01",
      rack: "R01",
      level: "N01",
      position: "U01",
      locationType: LocationType.RACK,
      status: LocationStatus.OCUPADO,
      coordinateX: 80,
      coordinateY: 80
    },
    {
      locationCode: "60000-A-P01-R01-N01-U02",
      zoneCode: "A",
      aisle: "P01",
      rack: "R01",
      level: "N01",
      position: "U02",
      locationType: LocationType.RACK,
      status: LocationStatus.LIBRE,
      coordinateX: 300,
      coordinateY: 80
    },
    {
      locationCode: "60000-A-P01-R02-N02-U01",
      zoneCode: "A",
      aisle: "P01",
      rack: "R02",
      level: "N02",
      position: "U01",
      locationType: LocationType.RACK,
      status: LocationStatus.RESERVADO,
      coordinateX: 520,
      coordinateY: 80
    },
    {
      locationCode: "60000-B-P02-R01-N01-U01",
      zoneCode: "B",
      aisle: "P02",
      rack: "R01",
      level: "N01",
      position: "U01",
      locationType: LocationType.RACK,
      status: LocationStatus.OCUPADO,
      coordinateX: 80,
      coordinateY: 200
    },
    {
      locationCode: "60000-B-P02-R01-N02-U01",
      zoneCode: "B",
      aisle: "P02",
      rack: "R01",
      level: "N02",
      position: "U01",
      locationType: LocationType.RACK,
      status: LocationStatus.BLOQUEADO,
      coordinateX: 300,
      coordinateY: 200
    },
    {
      locationCode: "60000-QAR-PISO-01",
      zoneCode: "QAR",
      aisle: "PISO",
      rack: "QAR",
      level: "01",
      position: "01",
      locationType: LocationType.QUARANTINE,
      status: LocationStatus.CUARENTENA,
      coordinateX: 520,
      coordinateY: 200
    },
    {
      locationCode: "60000-PAV-PISO-01",
      zoneCode: "PAV",
      aisle: "PISO",
      rack: "PAV",
      level: "01",
      position: "01",
      locationType: LocationType.PAV,
      status: LocationStatus.PAV,
      coordinateX: 80,
      coordinateY: 320
    },
    {
      locationCode: "60000-NPI-VALIDACION-01",
      zoneCode: "NPI",
      aisle: "VAL",
      rack: "NPI",
      level: "01",
      position: "01",
      locationType: LocationType.NPI,
      status: LocationStatus.NPI,
      coordinateX: 300,
      coordinateY: 320
    },
    {
      locationCode: "60000-VAL-PICK-01",
      zoneCode: "VAL",
      aisle: "VAL",
      rack: "PICK",
      level: "01",
      position: "01",
      locationType: LocationType.VALIDATION,
      status: LocationStatus.VALIDACION,
      coordinateX: 520,
      coordinateY: 320
    },
    {
      locationCode: "60000-DAN-PISO-01",
      zoneCode: "DAN",
      aisle: "PISO",
      rack: "DAN",
      level: "01",
      position: "01",
      locationType: LocationType.DAMAGED,
      status: LocationStatus.DANADO,
      coordinateX: 740,
      coordinateY: 320
    },
    {
      locationCode: "60000-PICK-A-01",
      zoneCode: "PICK",
      aisle: "PICK",
      rack: "A",
      level: "01",
      position: "01",
      locationType: LocationType.PICKING,
      status: LocationStatus.OCUPADO,
      coordinateX: 740,
      coordinateY: 80
    },
    {
      locationCode: "60000-PICK-A-02",
      zoneCode: "PICK",
      aisle: "PICK",
      rack: "A",
      level: "01",
      position: "02",
      locationType: LocationType.PICKING,
      status: LocationStatus.LIBRE,
      coordinateX: 740,
      coordinateY: 200
    }
  ];

  const result: Record<string, string> = {};

  for (const location of locations) {
    const record = await prisma.location.upsert({
      where: { locationCode: location.locationCode },
      update: {
        warehouseId,
        zoneId: zoneIds[location.zoneCode],
        aisle: location.aisle,
        rack: location.rack,
        level: location.level,
        position: location.position,
        locationType: location.locationType,
        status: location.status,
        maxBoxes: 120,
        maxWeightKg: 850,
        maxVolumeM3: 14.5,
        coordinateX: location.coordinateX,
        coordinateY: location.coordinateY,
        width: 180,
        height: 64,
        active: true
      },
      create: {
        warehouseId,
        zoneId: zoneIds[location.zoneCode],
        locationCode: location.locationCode,
        aisle: location.aisle,
        rack: location.rack,
        level: location.level,
        position: location.position,
        locationType: location.locationType,
        status: location.status,
        maxBoxes: 120,
        maxWeightKg: 850,
        maxVolumeM3: 14.5,
        coordinateX: location.coordinateX,
        coordinateY: location.coordinateY,
        width: 180,
        height: 64,
        active: true
      }
    });
    result[location.locationCode] = record.id;
  }

  return result;
}

async function seedDemoOperationalData(locationIds: Record<string, string>, adminUserId: string) {
  const demoLocationIdList = Object.values(locationIds);

  await prisma.inventoryLocation.deleteMany({
    where: { locationId: { in: demoLocationIdList } }
  });

  await prisma.locationBlockLog.deleteMany({
    where: { locationId: { in: demoLocationIdList } }
  });

  await prisma.locationMovement.deleteMany({
    where: { userId: adminUserId, sku: { startsWith: "DEMO-" } }
  });

  await prisma.inventoryLocation.createMany({
    data: [
      {
        locationId: locationIds["60000-A-P01-R01-N01-U01"],
        sku: "DEMO-SKU-001",
        description: "Detergente liquido 5L",
        lot: "L-DET-001",
        expirationDate: new Date("2026-12-20"),
        palletCode: "PALLET-DEMO-001",
        quantity: 48,
        unit: "CAJAS",
        status: InventoryStatus.AVAILABLE
      },
      {
        locationId: locationIds["60000-B-P02-R01-N01-U01"],
        sku: "DEMO-SKU-002",
        description: "Papel higienico premium pack x24",
        lot: "L-PAP-014",
        expirationDate: new Date("2027-02-10"),
        palletCode: "PALLET-DEMO-002",
        quantity: 72,
        unit: "CAJAS",
        status: InventoryStatus.AVAILABLE
      },
      {
        locationId: locationIds["60000-QAR-PISO-01"],
        sku: "DEMO-SKU-003",
        description: "Limpia pisos aroma citrus",
        lot: "L-QUA-009",
        expirationDate: new Date("2026-09-02"),
        palletCode: "PALLET-DEMO-003",
        quantity: 20,
        unit: "CAJAS",
        status: InventoryStatus.QUARANTINE
      },
      {
        locationId: locationIds["60000-PAV-PISO-01"],
        sku: "DEMO-SKU-004",
        description: "Campana PAV verano",
        lot: "L-PAV-001",
        expirationDate: new Date("2026-11-15"),
        palletCode: "PALLET-DEMO-004",
        quantity: 18,
        unit: "CAJAS",
        status: InventoryStatus.RESERVED
      },
      {
        locationId: locationIds["60000-PICK-A-01"],
        sku: "DEMO-SKU-005",
        description: "Shampoo familiar 750ml",
        lot: "L-PICK-101",
        expirationDate: new Date("2026-10-01"),
        palletCode: "PALLET-DEMO-005",
        quantity: 36,
        unit: "UNIDADES",
        status: InventoryStatus.AVAILABLE
      }
    ]
  });

  await prisma.locationBlockLog.create({
    data: {
      locationId: locationIds["60000-B-P02-R01-N02-U01"],
      previousStatus: LocationStatus.LIBRE,
      newStatus: LocationStatus.BLOQUEADO,
      reason: BlockReason.MANTENIMIENTO,
      comment: "Ruptura de parante lateral del rack.",
      userId: adminUserId
    }
  });

  await prisma.locationMovement.createMany({
    data: [
      {
        destinationLocationId: locationIds["60000-A-P01-R01-N01-U01"],
        sku: "DEMO-SKU-001",
        lot: "L-DET-001",
        palletCode: "PALLET-DEMO-001",
        quantity: 48,
        movementType: MovementType.ASSIGNMENT,
        reason: "Carga inicial de demo",
        userId: adminUserId
      },
      {
        destinationLocationId: locationIds["60000-B-P02-R01-N01-U01"],
        sku: "DEMO-SKU-002",
        lot: "L-PAP-014",
        palletCode: "PALLET-DEMO-002",
        quantity: 72,
        movementType: MovementType.ASSIGNMENT,
        reason: "Carga inicial de demo",
        userId: adminUserId
      },
      {
        originLocationId: locationIds["60000-B-P02-R01-N01-U01"],
        destinationLocationId: locationIds["60000-PICK-A-01"],
        sku: "DEMO-SKU-005",
        lot: "L-PICK-101",
        palletCode: "PALLET-DEMO-005",
        quantity: 12,
        movementType: MovementType.TRANSFER,
        reason: "Reposicion picking demo",
        userId: adminUserId
      }
    ]
  });
}

async function main() {
  const userIds = await upsertUsers();
  const warehouse = await upsertWarehouse();
  const zoneIds = await upsertZones(warehouse.id);
  const locationIds = await upsertLocations(warehouse.id, zoneIds);
  await seedDemoOperationalData(locationIds, userIds["admin@demo.com"]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
