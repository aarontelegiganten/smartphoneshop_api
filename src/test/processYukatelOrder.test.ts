import { mockYukatelOrder } from "@/mocks/yukatelOrder.mock";

describe("YukatelOrder model", () => {
  it("should have the correct basic structure", () => {
    expect(mockYukatelOrder).toHaveProperty("order_id");
    expect(mockYukatelOrder).toHaveProperty("editable", true);
    expect(mockYukatelOrder.totals.total).toBeGreaterThan(0);
    expect(mockYukatelOrder.items.length).toBeGreaterThan(0);
  });

  it("should contain valid item structure", () => {
    const item = mockYukatelOrder.items[0];
    expect(item.artnr).toBe("194252721384");
    expect(item.price).toBeGreaterThan(0);
    expect(item.is_shipping).toBe(false);
  });

  it("should have a valid shipping address", () => {
    const address = mockYukatelOrder.shippingAddress;
    expect(address.city).toBe("Taastrup");
    expect(address.country).toBe("Dänemark");
  });
});

describe("YukatelOrderResponse model", () => {
  it("should have the correct basic structure", () => {
    expect(mockYukatelOrder).toHaveProperty("order_id");
    expect(mockYukatelOrder).toHaveProperty("editable", true);
    expect(mockYukatelOrder.totals.total).toBeGreaterThan(0);
    expect(mockYukatelOrder.items.length).toBeGreaterThan(0);
  });

  it("should contain valid item structure", () => {
    const item = mockYukatelOrder.items[0];
    expect(item.artnr).toBe("194252721384");
    expect(item.price).toBeGreaterThan(0);
    expect(item.is_shipping).toBe(false);
  });

  it("should have a valid shipping address", () => {
    const address = mockYukatelOrder.shippingAddress;
    expect(address.city).toBe("Taastrup");
    expect(address.country).toBe("Dänemark");
  });
});
