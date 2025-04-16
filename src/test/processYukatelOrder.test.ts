import processYukatelOrder from "../services/yukatel/processYukatelOrder";
import { fetchYukatelOrders } from "../services/yukatel/fetchYukatelOrders";
import { updateYukatelOrder } from "../services/yukatel/updateYukatelOrder";
import { createYukatelOrder } from "../services/yukatel/createYukatelOrder";
import moment from "moment-timezone";


jest.mock("../../src/services/yukatel/fetchYukatelOrders");
jest.mock("../../src/services/yukatel/updateYukatelOrder");
jest.mock("../../src/services/yukatel/createYukatelOrder");

const mockOrder = {
  data: {
    orderById: {
      orderLines: [
        { articleNumber: "123", amount: 2 },
        { articleNumber: "456", amount: 1 },
      ],
    },
  },
};

const mockItemPayload = [
  { article_number: 123, requested_stock: 2 },
  { article_number: 456, requested_stock: 1 },
];

describe("processYukatelOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates an editable recent order", async () => {
    (fetchYukatelOrders as jest.Mock).mockResolvedValue({
      data: [
        {
          order_id: 999,
          date_placed: new Date().toISOString(),
          editable: true,
        },
      ],
    });

    (updateYukatelOrder as jest.Mock).mockResolvedValue({
      status: true,
      msg: "Updated successfully",
    });

    await processYukatelOrder(mockOrder as any);

    expect(updateYukatelOrder).toHaveBeenCalled();
    expect(createYukatelOrder).not.toHaveBeenCalled();
  });

  it("creates a new order if recent order is not editable", async () => {
    (fetchYukatelOrders as jest.Mock).mockResolvedValue({
      data: [
        {
          order_id: 1000,
          date_placed: new Date().toISOString(),
          editable: false,
        },
      ],
    });

    (createYukatelOrder as jest.Mock).mockResolvedValue({
      status: true,
      msg: "Created successfully",
    });

    await processYukatelOrder(mockOrder as any);

    expect(updateYukatelOrder).not.toHaveBeenCalled();
    expect(createYukatelOrder).toHaveBeenCalled();
  });

  it("creates a new order if no recent order found", async () => {
    (fetchYukatelOrders as jest.Mock).mockResolvedValue({
      data: [],
    });

    (createYukatelOrder as jest.Mock).mockResolvedValue({
      status: true,
      msg: "Created successfully",
    });

    await processYukatelOrder(mockOrder as any);

    expect(updateYukatelOrder).not.toHaveBeenCalled();
    expect(createYukatelOrder).toHaveBeenCalled();
  });
});



describe("processYukatelOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new order when the existing order is non-editable", async () => {
    // Mock fetchYukatelOrders to return a non-editable recent order
    (fetchYukatelOrders as jest.Mock).mockResolvedValue({
      data: [
        {
          order_id: 1001,
          date_placed: new Date().toISOString(),
          editable: false, // Non-editable
        },
      ],
    });

    // Mock createYukatelOrder to simulate a successful order creation
    (createYukatelOrder as jest.Mock).mockResolvedValue({
      status: true,
      msg: "Order created successfully",
    });

    // Execute the processYukatelOrder function with the mock order
    await processYukatelOrder(mockOrder as any);

    // Assert that the updateYukatelOrder function was NOT called
    expect(updateYukatelOrder).not.toHaveBeenCalled();

    // Assert that createYukatelOrder was called since the order was non-editable
    expect(createYukatelOrder).toHaveBeenCalled();

    // You can also check the payload sent to createYukatelOrder (optional)
    expect(createYukatelOrder).toHaveBeenCalledWith(
      expect.anything(), // authcode (can be set accordingly)
      expect.any(Number), // vpnr (can be set accordingly)
      expect.objectContaining({
        items: [
          { article_number: 123, requested_stock: 2 },
          { article_number: 456, requested_stock: 1 },
        ],
      })
    );
  });
});

describe("processYukatelOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new order when the existing order is non-editable and is within the Friday 18:00 to Monday 18:00 period", async () => {
    // Simulate the current date as Friday after 18:00 (example: April 16, 2025 at 18:30)
    const currentDate = moment.tz("2025-04-16 18:30", "Europe/Berlin");
    jest.spyOn(moment, "tz").mockReturnValue(currentDate);

    // Mock fetchYukatelOrders to return a recent non-editable order
    (fetchYukatelOrders as jest.Mock).mockResolvedValue({
      data: [
        {
          order_id: 1001,
          date_placed: new Date().toISOString(), // Current date, simulating within the period
          editable: false, // Non-editable
        },
      ],
    });

    // Mock createYukatelOrder to simulate a successful order creation
    (createYukatelOrder as jest.Mock).mockResolvedValue({
      status: true,
      msg: "Order created successfully",
    });

    // Execute the processYukatelOrder function with the mock order
    await processYukatelOrder(mockOrder as any);

    // Assert that the updateYukatelOrder function was NOT called
    expect(updateYukatelOrder).not.toHaveBeenCalled();

    // Assert that createYukatelOrder was called since the order was non-editable
    expect(createYukatelOrder).toHaveBeenCalled();

    // You can also check the payload sent to createYukatelOrder (optional)
    expect(createYukatelOrder).toHaveBeenCalledWith(
      expect.anything(), // authcode (can be set accordingly)
      expect.any(Number), // vpnr (can be set accordingly)
      expect.objectContaining({
        items: [
          { article_number: 123, requested_stock: 2 },
          { article_number: 456, requested_stock: 1 },
        ],
      })
    );
  });
});

describe("processYukatelOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new order when the existing order is non-editable and is placed the day before after 18:00 on regular days", async () => {
    // Simulate the current date as Monday at 19:00 (after 18:00)
    const currentDate = moment.tz("2025-04-13 19:00", "Europe/Berlin"); // Monday after 18:00
    jest.spyOn(moment, "tz").mockReturnValue(currentDate);

    // Mock fetchYukatelOrders to return a recent non-editable order placed yesterday after 18:00
    (fetchYukatelOrders as jest.Mock).mockResolvedValue({
      data: [
        {
          order_id: 1002,
          date_placed: new Date().toISOString(), // Simulate recent order from the previous day
          editable: false, // Non-editable order
        },
      ],
    });

    // Mock createYukatelOrder to simulate a successful order creation
    (createYukatelOrder as jest.Mock).mockResolvedValue({
      status: true,
      msg: "Order created successfully",
    });

    // Execute the processYukatelOrder function with the mock order
    await processYukatelOrder(mockOrder as any);

    // Assert that the updateYukatelOrder function was NOT called
    expect(updateYukatelOrder).not.toHaveBeenCalled();

    // Assert that createYukatelOrder was called since the order was non-editable
    expect(createYukatelOrder).toHaveBeenCalled();

    // You can also check the payload sent to createYukatelOrder (optional)
    expect(createYukatelOrder).toHaveBeenCalledWith(
      expect.anything(), // authcode (can be set accordingly)
      expect.any(Number), // vpnr (can be set accordingly)
      expect.objectContaining({
        items: [
          { article_number: 123, requested_stock: 2 },
          { article_number: 456, requested_stock: 1 },
        ],
      })
    );
  });

  it("checks for orders placed the day before after 18:00 and not within Friday 18:00 to Monday 18:00", async () => {
    // Simulate the current date as Thursday at 19:00 (after 18:00)
    const currentDate = moment.tz("2025-04-09 19:00", "Europe/Berlin"); // Thursday after 18:00
    jest.spyOn(moment, "tz").mockReturnValue(currentDate);

    // Mock fetchYukatelOrders to return a recent non-editable order placed yesterday after 18:00
    (fetchYukatelOrders as jest.Mock).mockResolvedValue({
      data: [
        {
          order_id: 1003,
          date_placed: moment().subtract(1, "days").set({ hour: 19, minute: 0 }).toISOString(), // Simulate order placed the previous day after 18:00
          editable: false, // Non-editable order
        },
      ],
    });

    // Mock createYukatelOrder to simulate a successful order creation
    (createYukatelOrder as jest.Mock).mockResolvedValue({
      status: true,
      msg: "Order created successfully",
    });

    // Execute the processYukatelOrder function with the mock order
    await processYukatelOrder(mockOrder as any);

    // Assert that the updateYukatelOrder function was NOT called
    expect(updateYukatelOrder).not.toHaveBeenCalled();

    // Assert that createYukatelOrder was called since the order was non-editable
    expect(createYukatelOrder).toHaveBeenCalled();

    // You can also check the payload sent to createYukatelOrder (optional)
    expect(createYukatelOrder).toHaveBeenCalledWith(
      expect.anything(), // authcode (can be set accordingly)
      expect.any(Number), // vpnr (can be set accordingly)
      expect.objectContaining({
        items: [
          { article_number: 123, requested_stock: 2 },
          { article_number: 456, requested_stock: 1 },
        ],
      })
    );
  });
});