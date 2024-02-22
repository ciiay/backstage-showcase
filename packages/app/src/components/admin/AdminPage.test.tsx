import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import * as pluginPermission from '@backstage/plugin-permission-react';
import { AdminTabs } from './AdminTabs';
import { AdminPage } from './AdminPage';

jest.mock('@backstage/plugin-permission-react', () => ({
  __esModule: true,
  ...jest.requireActual('@backstage/plugin-permission-react'),
}));

jest.mock('./AdminTabs', () => ({
  AdminTabs: jest.fn(),
}));

const mockAdminTabs = AdminTabs as jest.MockedFunction<typeof AdminTabs>;

describe('AdminPage', () => {
  beforeEach(() => {
    mockAdminTabs.mockClear();
  });

  const mockUsePermission = jest.spyOn(pluginPermission, 'usePermission');

  it('should display loader while loading permissions', () => {
    mockUsePermission.mockReturnValue({ loading: true, allowed: false });

    render(<AdminPage />);

    expect(screen.queryByText('RBAC')).not.toBeInTheDocument();
    expect(screen.queryByText('Plugins')).not.toBeInTheDocument();
  });

  it('should display only plugins tab when RBAC is not allowed', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    mockAdminTabs.mockImplementation(() => <div>Plugins</div>);
    jest.mock('./AdminTabs', () => ({
      AdminTabs: jest.fn().mockImplementation,
    }));

    render(<AdminPage />);

    await waitFor(() =>
      expect(screen.getByText('Plugins')).toBeInTheDocument(),
    );
    expect(screen.queryByText('RBAC')).not.toBeInTheDocument();
  });

  it('should display both RBAC and plugins tabs when RBAC is allowed', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockAdminTabs.mockImplementation(() => (
      <div>
        <div>RBAC</div>
        <div>Plugins</div>
      </div>
    ));

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Plugins')).toBeInTheDocument();
      expect(screen.getByText('RBAC')).toBeInTheDocument();
    });
  });
});
