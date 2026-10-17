import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { UserPreviewDto } from '../interfaces/user-preview.dto.js';

@Injectable()
export class UsersService {
  private readonly apiUrl =
    process.env.ASTUSHA_ID_URL ?? 'http://localhost:3002';

  constructor(private readonly httpService: HttpService) {}

  async getUsersByIds(
    ids: string[],
    cookie?: string,
  ): Promise<UserPreviewDto[]> {
    if (!ids.length) {
      return [];
    }

    const { data } = await firstValueFrom(
      this.httpService.post<UserPreviewDto[]>(
        `${this.apiUrl}/users/by-ids`,
        { ids },
        {
          headers: cookie ? { Cookie: cookie } : {},
        },
      ),
    );

    return data;
  }
}
