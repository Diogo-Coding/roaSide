<template>
  <nav
    role="navigation"
    aria-label="main navigation"
    class="navbar has-shadow"
  >
    <div class="container">
      <div class="navbar-brand">
        <a
          href="/"
          aria-current="page"
          class="navbar-item router-link-exact-active router-link-active"
        >
          <img
            src="@/assets/logo.png"
            alt="Spring Hoteles"
          >
          <p
            title="ROA - Spring Hoteles"
            class="has-text-weight-bold is-size-5 ml-4"
          >
            ROA - Spring Hoteles
          </p>
        </a>
        <a
          role="button"
          aria-label="menu"
          class="navbar-burger burger"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'MainNavbar'
}
</script>
