// Adopted from yamiez.c
// ref: https://codereview.stackexchange.com/questions/118909/custom-memcmp-function/118950#118950
int memcmp(const void *vl, const void *vr, size_t n)
{
  typedef unsigned char byte_type;
  typedef unsigned long word_type;

  const size_t word_size  = sizeof(word_type);
  const size_t word_align = (word_size >= 8) ? word_size : 8;

  const uintptr_t align_mask = word_align - 1;

  const byte_type *buf1 = vl;
  const byte_type *buf2 = vr;

  const uintptr_t addr1 = (uintptr_t) vl;
  const uintptr_t addr2 = (uintptr_t) vr;

  if ((addr1 & align_mask) == (addr2 & align_mask)) {
    const uintptr_t skip = word_align - (addr1 & align_mask);

    for (uintptr_t i = 0; i < skip; ++i) {
      if (*buf1++ != *buf2++)
        goto end;
      --n;
    }

    const word_type * wbuf1 = (const word_type *) buf1;
    const word_type * wbuf2 = (const word_type *) buf2;

    while (n >= word_size) {
      if (*wbuf1++ != *wbuf2++)
        goto end;
      n -= word_size;
    }

    buf1 = (const byte_type *) wbuf1;
    buf2 = (const byte_type *) wbuf2;
  }

  while (n--) {
    if (*buf1++ != *buf2++)
      goto end;
  }

end:
  return n ? *buf1 - *buf2 : 0;
}
