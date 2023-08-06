import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'suffixBn',
})
export class SuffixBnPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): unknown {
    if (isNaN(value)) {
      return 'Invalid input: provide a number';
    }

    if (Math.abs(value) >= 1e9) {
      return (value / 1e9).toFixed(2) + ' Bn';
    }

    return value.toString();
  }
}
