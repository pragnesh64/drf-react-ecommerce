import React, { useContext } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import UserContext from "../context/userContext";
import SearchBox from "./searchBox";

function Header({ keyword, setKeyword }) {
  const { userInfo } = useContext(UserContext);

  return (
    <header>
      <Navbar expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <i className="fas fa-store me-2"></i>ShopSphere
            </Navbar.Brand>
          </LinkContainer>
          <SearchBox keyword={keyword} setKeyword={setKeyword} />
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <LinkContainer to="/cart">
                <Nav.Link>
                  <i className="fas fa-shopping-cart me-1" />Cart
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/contact">
                <Nav.Link>
                  <i className="fas fa-envelope me-1" />Contact
                </Nav.Link>
              </LinkContainer>
              {userInfo && (
                <>
                  <LinkContainer to="/wishlist">
                    <Nav.Link>
                      <i className="fas fa-heart me-1" />Wishlist
                    </Nav.Link>
                  </LinkContainer>
                  <NavDropdown title={
                    <span>
                      <i className="fas fa-user-circle me-1"></i>{userInfo.username}
                    </span>
                  } id="username">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>
                        <i className="fas fa-user me-2"></i>Profile
                      </NavDropdown.Item>
                    </LinkContainer>
                    {userInfo.isAdmin && (
                      <>
                        <NavDropdown.Divider />
                        <NavDropdown.Header className="text-muted small">ADMIN</NavDropdown.Header>
                        <LinkContainer to="/admin-dashboard">
                          <NavDropdown.Item>
                            <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                          </NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/products">
                          <NavDropdown.Item>
                            <i className="fas fa-box me-2"></i>Manage Products
                          </NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/catalog">
                          <NavDropdown.Item>
                            <i className="fas fa-tags me-2"></i>Brands &amp; Categories
                          </NavDropdown.Item>
                        </LinkContainer>
                      </>
                    )}
                    <NavDropdown.Divider />
                    <LinkContainer to="/logout">
                      <NavDropdown.Item className="text-danger">
                        <i className="fas fa-sign-out-alt me-2"></i>Logout
                      </NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                </>
              )}
              {!userInfo && (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="fas fa-sign-in-alt me-1" />Login
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
