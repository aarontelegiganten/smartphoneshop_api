import { updateYukatelOrder } from '@/services/yukatel/updateYukatelOrder';
import mockAxios from 'jest-mock-axios'; // Mocked Axios

describe('updateYukatelOrder', () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it('should update the order successfully', async () => {
    const order_id = 851272;
    const authcode = '21904-907e48be-c336-11ed-96d4-0050568c8f1a';
    const vpnr = 21904;
    const newItems = [
      { article_number: 8806095859415, requested_stock: 2 },
      { article_number: 194252707555, requested_stock: 3 },
    ];
    const customer_address_id = 0;
    const customer_reference = '21904';

    const mockResponse = {
      status: true,
      msg: 'success',
      order_id: 851272,
    };

    mockAxios.put.mockResolvedValue({ data: mockResponse });

    const response = await updateYukatelOrder(
      order_id,
      authcode,
      vpnr,
      newItems,
      customer_address_id,
      customer_reference
    );

    expect(response).toEqual(mockResponse);
    expect(mockAxios.put).toHaveBeenCalledTimes(1);
    expect(mockAxios.put).toHaveBeenCalledWith(
      expect.stringContaining(`/order/update/${order_id}`),
      expect.objectContaining({
        items: expect.arrayContaining(newItems),
        customer_address_id,
        customer_reference,
      })
    );
  });

  it('should handle API errors correctly', async () => {
    const order_id = 851272;
    const authcode = '21904-907e48be-c336-11ed-96d4-0050568c8f1a';
    const vpnr = 21904;
    const newItems = [
      { article_number: 8806095859415, requested_stock: 2 },
      { article_number: 194252707555, requested_stock: 3 },
    ];
    const customer_address_id = 0;
    const customer_reference = '21904';

    const mockError = { response: { data: { message: 'Invalid data' } } };
    mockAxios.put.mockRejectedValue(mockError);

    await expect(
      updateYukatelOrder(
        order_id,
        authcode,
        vpnr,
        newItems,
        customer_address_id,
        customer_reference
      )
    ).rejects.toThrow('Invalid data');
  });
});
